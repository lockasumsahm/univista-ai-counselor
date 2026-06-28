import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { pushNotification } from "@/lib/notify";
import { toUnifiedProfile, type UnifiedProfile } from "@/lib/profileSchema";
import { useMemo } from "react";

export interface ProfileData {
  name: string;
  email: string;
  gpa: string;
  testScores: string;
  extracurriculars: string;
  courseRigor: string;
  apIbCourses: string;
  legacyStatus: string;
  firstGenStatus: string;
  athleticsStatus: string;
  artsPortfolio: string;
  demonstratedInterest: string;
  geographicLocation: string;
  essayStrength: string;
  recommendationStrength: string;
  preferredCountries: string[];
  cv: File | null;
  aLevelGrades: string;
  predictedGrades: string;
  gaokaoScore: string;
  nationalExamType: string;
  nationalExamScore: string;
  baccalaureateScore: string;
  researchExperience: string;
  volunteerHours: string;
  workExperience: string;
  intendedMajor: string;
}

const fetchProfileData = async (userId: string, userEmail?: string): Promise<ProfileData | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    name: data.name || "",
    email: data.email || userEmail || "",
    gpa: data.gpa || "",
    testScores: data.test_scores || "",
    extracurriculars: data.extracurriculars || "",
    courseRigor: data.course_rigor || "",
    apIbCourses: data.honors_awards || "",
    legacyStatus: data.legacy_status || "",
    firstGenStatus: data.first_generation ? "first-gen" : "not-first-gen",
    athleticsStatus: data.athletics || "",
    artsPortfolio: data.special_talents || "",
    demonstratedInterest: "",
    geographicLocation: data.country || "",
    essayStrength: "",
    recommendationStrength: "",
    preferredCountries: data.target_countries || [],
    cv: null,
    aLevelGrades: data.a_level_grades || "",
    predictedGrades: data.predicted_grades || "",
    gaokaoScore: data.gaokao_score || "",
    nationalExamType: data.national_exam_type || "",
    nationalExamScore: data.national_exam_score || "",
    baccalaureateScore: data.baccalaureate_score || "",
    researchExperience: data.research_experience || "",
    volunteerHours: data.volunteer_hours || "",
    workExperience: data.work_experience || "",
    intendedMajor: data.intended_major || "",
  };
};

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  

  const { data: profile = null, isLoading: loading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfileData(user!.id, user?.email),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const saveProfile = async (profileData: ProfileData, opts?: { resumeText?: string; resumeFileName?: string; label?: string }) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const dbProfile: any = {
        user_id: user.id,
        name: profileData.name,
        email: profileData.email,
        country: profileData.geographicLocation,
        target_countries: profileData.preferredCountries,
        gpa: profileData.gpa,
        test_scores: profileData.testScores,
        extracurriculars: profileData.extracurriculars,
        course_rigor: profileData.courseRigor,
        honors_awards: profileData.apIbCourses,
        legacy_status: profileData.legacyStatus,
        first_generation: profileData.firstGenStatus === "first-gen",
        athletics: profileData.athleticsStatus,
        special_talents: profileData.artsPortfolio,
        a_level_grades: profileData.aLevelGrades || null,
        predicted_grades: profileData.predictedGrades || null,
        gaokao_score: profileData.gaokaoScore || null,
        national_exam_type: profileData.nationalExamType || null,
        national_exam_score: profileData.nationalExamScore || null,
        baccalaureate_score: profileData.baccalaureateScore || null,
        research_experience: profileData.researchExperience || null,
        volunteer_hours: profileData.volunteerHours || null,
        work_experience: profileData.workExperience || null,
        intended_major: profileData.intendedMajor || null,
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(dbProfile, { onConflict: "user_id" });

      if (error) throw error;

      // Update cache immediately
      queryClient.setQueryData(["profile", user.id], profileData);

      // Snapshot a versioned history row (fire-and-forget; never block save UX)
      const { cv, ...snapshot } = profileData as any;
      void supabase.from("profile_versions").insert({
        user_id: user.id,
        snapshot,
        resume_file_name: opts?.resumeFileName ?? cv?.name ?? null,
        resume_text: opts?.resumeText ?? null,
        label: opts?.label ?? null,
      }).then(({ error: vErr }) => {
        if (vErr) console.warn("profile_versions snapshot failed:", vErr.message);
      });

      // Drop a single welcome notification per save event.
      // The dedupe key keeps it as one row until the user reads it.
      pushNotification(user.id, {
        title: "Profile saved",
        message: "We're matching you against verified university admit data. Open University Alignment to see your #1 pick.",
        link: "/dashboard/matches",
        type: "success",
        dedupeKey: "profile_saved",
        suppressIfVisited: "/dashboard/matches",
      });

      return { error: null };
    } catch (error) {
      console.error("Error saving profile:", error);
      return { error: error as Error };
    }
  };

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!profile) return { error: new Error("No profile loaded") };
    const updatedProfile = { ...profile, ...updates };
    return saveProfile(updatedProfile);
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
  };

  // Unified profile (single source of truth) — derived, memoized.
  const unified: UnifiedProfile = useMemo(
    () => toUnifiedProfile(profile ?? {}),
    [profile]
  );

  return {
    profile,
    unified,
    loading,
    saveProfile,
    updateProfile,
    refetch,
  };
};
