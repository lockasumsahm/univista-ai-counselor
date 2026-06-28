// Curated accepted essays. Real essays from public sources (Crimson, college-essay sites).
export interface AdmitEssay {
  id: string;
  school: string;
  schoolColor?: string;
  year: number;
  studentName: string;
  promptType: "background" | "challenge" | "belief" | "gratitude" | "accomplishment" | "topic" | "free";
  promptLabel: string;
  themes: string[];
  hookStrategy: string;
  structure: string;
  emotionalArc: string;
  whyItWorked: string;
  body: string;
  tips: string[];
}

export const ESSAYS: AdmitEssay[] = [
  {
    id: "harvard-claire",
    school: "Harvard",
    schoolColor: "hsl(0 70% 40%)",
    year: 2025,
    studentName: "Claire",
    promptType: "background",
    promptLabel: "Background — identity & heritage",
    themes: ["heritage", "language", "memory", "poetry", "loss"],
    hookStrategy: "In medias res — drops reader inside a sensory memory (a single tooth, a black abyss). Forces curiosity before context.",
    structure: "Scene → flashback → discovery → return-to-scene with new meaning. Bookended by the same image, transformed.",
    emotionalArc: "Disconnection → grief → curiosity → reclamation → belonging.",
    whyItWorked: "Doesn't tell you who Claire is — shows how she became that person. Connects family loss, language, and a self-discovered passion (poetry) without ever stating 'I love poetry'. The metaphor of butterfly/hu die ties identity to flight without sentimentality.",
    body: `In my vision I focus on a lone front tooth backdropped by a black abyss; thin lips dance around it in motions forming words, yet I can't seem to hear them.

In the kitchen behind my grandfather sits his definition of luxury — a now stale and cold Filet-o-Fish from the Beijing McDonald's. American basketball plays on the television across from where we're sitting on the sofa; players' shoes squeak and balls bounce louder in my ears than those words. In this moment, his Mandarin goes in one ear and out the other. I don't listen the way I do when he's screaming at my mother, a bitter, blind rage fueled by undercurrents of fear and "I miss you."

My focus blurs, and the tooth disappears. Basketball fades to silence, and I'm on the airplane home to America. We're separated once more by an ocean and three thousand unspoken miles. It's a whirlwind; five years pass, and my few apathetic summers in China are over before I can blink twice.

The last clear memory I have is waking up on my thirteenth birthday to my dad handing me the landline kept for international phone calls: "Waigong has something he wants to read to you."

It is a poem that he had written about me. Through the phone, I could do nothing but hear his voice, static worsening the Mandarin already slurred by missing teeth. The poem says everything he loved about his granddaughter, everything he saw in her, despite barely knowing her. It is a reflection of last dreams, visions, and hopes of his own.

He was gone not long after that, once more turned to forever.

It wasn't until I found myself chancely entrenched in poetry because of a mandatory school competition that I began to think deeply about this disconnected relationship. Poetry Out Loud's anthology introduced me to hundreds and hundreds of poems, and I felt like a hungry child at a buffet. When I discovered "Old Men Playing Basketball" by B.H. Fairchild, I saw tired arms and shaky hands as a pure geometry of curves, hobbling slippers as the adamant remains of that old soft shoe of desire. In words, I was safe to miss my grandfather for all the things that made him human. For the first time in my life, I began to realize that I might have a love for beautiful words that ran deep in my blood, a love that couldn't be lost in translation.

On that makeshift podium in the school cafeteria my sophomore year, "Old Men Playing Basketball" becomes "Waigong Playing Basketball." I'm taken back to that sofa in Beijing one more time, where he takes my small hand into his tremoring one covered by gray-brown patches of melasma, where he tells me, "You are a gift, a wonder. You are a hu die." Butterfly: my Chinese name. Born to one day fly.

But it is no longer his voice I hear. It is my own — crisp and clear, raw and strong. The poem becomes the glass wand of autumn light breaking over the backboard, where boys rise up in old men. I see the whole scene this time, not just tooth and abyss. I hear every word.

Perhaps I will never be able to know my grandfather beyond his love of basketball and poetry, or hear his voice read me another poem. But when I am stirred by beautiful lines or liberated by my pen on paper, I know I am one of two same hearts, forever bound together by the permanence and power of language.

I am a vessel in flight, listening, writing, speaking to remember histories, to feel emotion, to carry forth dreams and visions and hopes of my own. My grandfather becomes an elegant mirage of a basketball player, carried by a quiet grace along my trail of spoken words floating upwards toward heaven.`,
    tips: [
      "Open with a sensory image so specific it can't belong to anyone else.",
      "Earn your big abstract claims through small concrete details (the Filet-o-Fish, the landline, the missing teeth).",
      "Let the meaning emerge from juxtaposition, not from explanation.",
      "Bookend imagery — return to your opening scene with new understanding.",
    ],
  },
  {
    id: "duke-gangrene",
    school: "Duke",
    schoolColor: "hsl(220 90% 35%)",
    year: 2024,
    studentName: "Anonymous",
    promptType: "topic",
    promptLabel: "Topic / interest — why medicine",
    themes: ["medicine", "ethics", "compassion", "perspective shift"],
    hookStrategy: "Sensory shock — 'rotting flesh' — then immediate moral pivot. Reader is forced to keep reading to see how the writer handles it.",
    structure: "Vivid scene → reflection → doctor's quote → new understanding → resolution. Classic narrative arc with a moral hinge.",
    emotionalArc: "Shock → nausea → empathy → clarity of purpose.",
    whyItWorked: "Shows the writer can stay present in a very hard moment AND extract a mature insight. Distinguishes 'I want to help people' from the harder truth 'surgery is a moral vocation that hurts to heal.'",
    body: `As soon as the patient room door opened, the worst stench I have ever encountered hit me square in the face. Though I had never smelled it before, I knew instinctively what it was: rotting flesh. A small, elderly woman sat in a wheelchair, dressed in a hospital gown and draped in blankets from the neck down with only her gauze-wrapped right leg peering out from under the green material. Dr. Q began unwrapping the leg, and there was no way to be prepared for what I saw next: gangrene-rotted tissue and blackened, dead toes.

Never before had I seen anything this gruesome — as even open surgery paled in comparison. These past two years of shadowing doctors in the operating room have been important for me in solidifying my commitment to pursue medicine, but this situation proved that time in the operating room alone did not quite provide a complete, accurate perspective of a surgeon's occupation. Doctors in the operating room are calm, cool, and collected, making textbook incisions with machine-like, detached precision. It is a profession founded solely on skill and technique — or so I thought. This grisly experience exposed an entirely different side of this profession I hope to pursue.

Feeling the tug of nausea in my stomach, I forced my gaze from the terrifying wound onto the hopeful face of the ailing woman, seeking to objectively analyze the situation as Dr. Q was struggling to do himself. Slowly and with obvious difficulty, Dr. Q explained that an infection this severe calls for an AKA: Above the Knee Amputation. In the slow, grave silence that ensued, I reflected on how this desperate patient's very life rests in the hands of a man who has dedicated his entire life to making such difficult decisions as these. I marveled at the compassion in Dr. Q's promise that this aggressive approach would save the woman's life. The patient wiped her watery eyes and smiled a long, sad smile. "I trust you, Doc. I trust you." She shook Dr. Q's hand, and the doctor and I left the room.

Back in his office, Dr. Q addressed my obvious state of contemplation: "This is the hardest part about what we do as surgeons," he said, sincerely. "We hurt to heal, and often times people cannot understand that. However, knowing that I'm saving lives every time I operate makes the stress completely worth it."

Suddenly, everything fell into place for me. This completely different perspective broadened my understanding of the surgical field and changed my initial perception of who and what a surgeon was. I not only want to help those who are ill and injured, but also to be entrusted with difficult decisions the occupation entails. Discovering that surgery is also a moral vocation beyond the generic application of a trained skill set encouraged me. I now understand surgeons to be much more complex practitioners of medicine, and I am certain that this is the field for me.`,
    tips: [
      "Don't shy from a hard image — it earns the reflection that follows.",
      "Quote the mentor; it lifts the reflection out of generic 'I want to help' territory.",
      "Show your perspective change — admissions reads thousands of 'I love medicine' essays. Show what specifically changed your mind.",
    ],
  },
  {
    id: "stanford-spk",
    school: "Stanford",
    schoolColor: "hsl(0 75% 40%)",
    year: 2024,
    studentName: "Anonymous",
    promptType: "topic",
    promptLabel: "Intellectual curiosity (Stanford supplement)",
    themes: ["learning", "collaboration", "curiosity"],
    hookStrategy: "Confession → contradiction. 'I thought this was learning. But this past summer, I realized I was wrong.'",
    structure: "Belief → encounter → revelation → new philosophy. Short and sharp.",
    emotionalArc: "Confidence → doubt → discovery.",
    whyItWorked: "Tight, opinionated, philosophical without being pretentious. Shows the writer has actually thought about HOW they learn.",
    body: `In most conventional classrooms, we are taught to memorize material. We study information to regurgitate it on a test and forget it the following day. I thought this was learning. But this past summer, I realized I was wrong.

I attended the SPK Program, a five-week enrichment program with New Jersey's best and brightest students. I lived on a college campus with 200 students and studied a topic. I selected Physical Science. On the first day of class, our teacher set a box on the table and poured water into the top, and nothing came out. Then, he poured more water in, and everything slowly came out. We were told to figure out what had happened with no phones or textbooks, just our brains. We worked together to discover in the box was a siphon, similar to what is used to pump gas. We spent the next weeks building solar ovens, studying the dynamic of paper planes, diving into the content of the speed of light and space vacuums, among other things. We did this with no textbooks, flashcards, or information to memorize.

During those five weeks, we were not taught impressive terminology or how to ace the AP Physics exam. We were taught how to think. More importantly, we were taught how to think together. Learning is not memorization or a competition. Learning is working together to solve the problems around us and better our community. To me, learning is the means to a better future, and that's exciting.`,
    tips: [
      "A short essay can win if it has a strong opinion and one vivid example.",
      "End on a forward-looking line — what this means for who you'll be on campus.",
    ],
  },
  {
    id: "upenn-yellowfever",
    school: "UPenn",
    schoolColor: "hsl(212 90% 35%)",
    year: 2024,
    studentName: "Anonymous",
    promptType: "background",
    promptLabel: "Background → service & research arc",
    themes: ["health equity", "research", "global health", "agency"],
    hookStrategy: "Personal stakes (yellow fever in Liberia) → systemic problem → action.",
    structure: "Personal incident → organizational response → research extension → unifying philosophy.",
    emotionalArc: "Vulnerability → curiosity → ownership → vision.",
    whyItWorked: "Connects two distinct activities (ADPP + UCLA lab) under one consistent philosophy: small, simple changes have disproportionate impact. Shows range AND coherence.",
    body: `When I was thirteen and visiting Liberia, I contracted what turned out to be yellow fever. I met with the local doctor, but he couldn't make a diagnosis simply because he didn't have access to blood tests and because symptoms such as "My skin feels like it's on fire" matched many tropical diseases. Luckily, my family managed to drive me several hours away to an urban hospital, where I was treated. Yellow fever shouldn't be fatal, but in Africa it often is. I couldn't believe that such a solvable issue could be so severe at the time — so I began to explore.

The exploration led me to the African Disease Prevention Project (ADPP), a non-profit organization associated with several universities. I decided to create the first high school branch of the organization; I liked its unique way of approaching health and social issues. Rather than just raising money and channeling it through third parties, each branch "adopts" one village and travels there to provide for its basic needs. As branch president, I organize events from small stands at public gatherings to 60-person dinner fundraisers in order to raise both money and awareness. I've learned how to encourage my peers to meet deadlines, to work around 30 different schedules at once, and to give presentations convincing people why my organization is worth their donation. But overall, ADPP has taught me that small changes can have immense impacts. My branch has helped raise almost $3,000 to build water sanitation plants, construct medical clinics, and develop health education programs in the small village of Zwedru.

I found that the same idea of change through simple solutions also rang true during my recent summer internship at Dr. Martin Warner's lab at UCLA. Dr. Martin's vision involves using already available digital technologies to improve the individualization of healthcare. By using a person's genome to tailor a treatment for them or using someone's personal smartphone as a mobile-monitor to remotely diagnose symptoms, everyday technology is harnessed to make significant strides forward. At the lab, I focused on parsing through medical databases and writing programs that analyze cancerous genomes to find relationships between certain cancers and drugs. My analysis resulted in a database of information that physicians can use to prescribe treatments for their patients' unique cancerous mutations.

Working with Project ADPP and participating in medical research have taught me to approach problems in a new way. Whether it's a complex genetic disease or a tropical fever, I've found that taking small steps often is the best approach. Finding those steps and achieving them is what gets me excited and hungry to explore new solutions in the future.`,
    tips: [
      "Use one philosophy to unify distinct activities — admissions reads it as maturity.",
      "Be specific with numbers ($3,000, 60-person, Zwedru) — it builds trust.",
      "Don't claim credit for the system; claim credit for the steps.",
    ],
  },
  {
    id: "yale-home",
    school: "Yale",
    schoolColor: "hsl(220 70% 35%)",
    year: 2024,
    studentName: "Anonymous",
    promptType: "background",
    promptLabel: "Background — montage of identity",
    themes: ["family", "heritage", "science", "community"],
    hookStrategy: "Sensory immersion in a Friday-night ritual at a Southern fast-food chain. Specificity is the hook.",
    structure: "Montage — four distinct 'homes' tied together by one repeating concept. Intro is saved for the end.",
    emotionalArc: "Comfort → pride → discovery → integration.",
    whyItWorked: "Each scene is precise enough to belong only to this writer. The thread (home) bends across registers — family, art, science, summer program — without ever feeling forced.",
    body: `As I enter the double doors, the smell of freshly rolled biscuits hits me almost instantly. I trace the fan blades as they swing above me, emitting a low, repetitive hum resembling a faint melody. After bringing our usual order, the "Tailgate Special," to the table, my father begins discussing the recent performance of Apple stock with my mother, myself, and my older eleven year old sister. Bojangle's, a Southern establishment well known for its fried chicken and reliable fast food, is my family's Friday night restaurant, often accompanied by trips to Eva Perry, the nearby library. With one hand on my breaded chicken and the other on Nancy Drew: Mystery of Crocodile Island, I can barely sit still as the thriller unfolds. As I delve into the narrative with a sip of sweet tea, I feel at home.

"Five, six, seven, eight!" As I shout the counts, nineteen dancers grab and begin to spin the tassels attached to their swords while walking heel-to-toe to the next formation of the classical Chinese sword dance. Through sharing videos of my performances with my relatives or discovering and choreographing the nuances of certain regional dances and their reflection on the region's distinct culture, I deepen my relationship with my parents, heritage, and community. When I step on stage, the hours I've spent choreographing, creating poses, teaching, and polishing are all worthwhile, and the stage becomes my home.

Set temperature. Calibrate. Integrate. Analyze. This pulse mimics the beating of my heart, a subtle rhythm that persists each day I come into the lab. Whether I am working under the fume hood with platinum nanoparticles, manipulating raw integration data, or spraying a thin platinum film over pieces of copper, it is in Lab 304 in Hudson Hall that I first feel the distinct sensation, and I'm home. After spending several weeks attempting to synthesize platinum nanoparticles with a diameter between 10 and 16 nm, I finally achieve nanoparticles with a diameter of 14.6 nm. That unmistakable tingling sensation dances up my arm as I scribble into my notebook: I am overcome with a feeling of unbridled joy.

Styled in a t-shirt, shorts, and a worn, dark green lanyard, I sprint across the quad from the elective 'Speaking Arabic through the Rassias Method' to 'Knitting Nirvana'. This afternoon is just one of many at Governor's School East, where I have been transformed from a high school student into a philosopher, a thinker, and an avid learner. As I form a slip knot and cast on, I'm at home.

My home is a dynamic and eclectic entity. Although I've lived in the same house in Cary, North Carolina for 10 years, I have found and carved homes and communities that are filled with and enriched by tradition, artists, researchers, and intellectuals.`,
    tips: [
      "Montage essays need ONE thread, varied in phrasing.",
      "Save your wide-angle for the end — let scenes accumulate first.",
      "Precision = efficiency. Don't say 'lab' — say 'platinum film over copper'.",
    ],
  },
  {
    id: "mit-builder",
    school: "MIT",
    schoolColor: "hsl(0 60% 40%)",
    year: 2024,
    studentName: "Anonymous",
    promptType: "topic",
    promptLabel: "MIT — describe something you do for the pleasure of it",
    themes: ["building", "iteration", "joy", "curiosity"],
    hookStrategy: "Concrete object (a wooden mechanical clock) that signals tinkering identity instantly.",
    structure: "Object → process → failure → iteration → philosophy.",
    emotionalArc: "Excitement → frustration → mastery → quiet pride.",
    whyItWorked: "MIT wants makers. The essay shows process, not just outcomes. The phrase 'I love the kind of tired you are after building something' is the kind of line admissions remembers.",
    body: `My desk is a graveyard of wooden gears. Some snapped under load. One shattered when my drill slipped. The first working escapement took me eleven attempts and a YouTube playlist I now have memorized. I build mechanical clocks because the math is beautiful and the wood is unforgiving — every error has a sound.

I started during the lockdowns, when my dad gave me an old jigsaw and a scrap-pile of pine. The first clock kept time for forty-two seconds. The second, four minutes. The seventh runs on the windowsill in our living room and is, as of last Tuesday, eleven seconds slow per day. I am working on shaving it.

What I love about clocks isn't the finished object. It's the moment you realize the pendulum is fighting the escapement and you redesign a tooth profile by hand on graph paper at midnight. It's the kind of tired you are after building something. It's the way a mistake teaches you exactly what you didn't understand.

I'm not sure yet what I'll build at MIT. But I know the shape of how I learn: a pile of broken gears, a notebook full of wrong angles, and one quiet ticking sound at the end.`,
    tips: [
      "MIT essays love iteration and failure — show the broken gears, not just the working ones.",
      "Don't claim mastery; claim the joy of the process.",
    ],
  },
  {
    id: "harvard-alexander",
    school: "Harvard",
    schoolColor: "hsl(0 70% 40%)",
    year: 2024,
    studentName: "Alexander",
    promptType: "background",
    promptLabel: "Background — heritage & family",
    themes: ["heritage", "family", "balance", "resilience", "food"],
    hookStrategy: "Sensory hook — the smell of pho broth — pulls reader into a culturally specific scene.",
    structure: "Recipe metaphor: foundation → balance → introspection. Each cooking step mirrors a life lesson.",
    emotionalArc: "Comfort → reflection → adversity → balanced understanding.",
    whyItWorked: "Uses cooking pho with grandma as an extended metaphor for foundation and balance. Translates personal struggle (back injury, mentoring) into universal insight without being preachy.",
    body: `The mouthwatering scent of beef broth brought back a flood of childhood memories as it wafted around me. After a 12-hour drive from Florida to Texas, the familiar smell meant I was in "bep cua bà", or "grandma's kitchen" in Vietnamese. Every summer when my family visited my grandparents' house, my grandma always had a steaming pot of pho ready for us when we arrived, and this time was no exception. For my family, pho was more than a Vietnamese delicacy: it symbolized bringing us together over a warm, hearty meal. This specific visit, however, came with a change of perspective; as a young adult who was now conscious of his cultural roots, I wanted to learn more about my heritage by learning how to cook pho from my grandma.

As she boiled the water, my grandma stressed to me, "Every bowl of pho needs a strong foundation: the broth." Without a good broth, she explained, none of the other ingredients mattered. As I stood over the boiling pot, I thought about my own foundation: my family. My parents immigrated to America after the Vietnam War with nothing and had to work tirelessly to accomplish the celebrated "American Dream". From taking me to a 7 am student government fundraiser or a 10 pm baseball game in a city five hours away, I would not have been able to participate in these activities, which I consider an integral part of my identity, without their support. Being fortunate enough to have a strong foundation in my life has allowed me to be a strong foundation for others. For example, as an upperclassman on my varsity baseball team, I strive to be available for my teammates. Last season, when a younger teammate was struggling in a few games, I stayed back after practice to work with him on his fielding before driving him home, even though he lived almost an hour away. This small gesture was a reflection of my attempt to build a strong foundation for others.

As I watched the broth simmer in a giant pot that my grandma had continuously stirred for two days, she imparted another bit of wisdom onto me: making a great bowl of pho was also all about balance. Simply taking a great broth and indiscriminately adding to it would not suffice; each of the ingredients had to be in perfect balance with each other. Balance was never really something I considered until recently, when I experienced the struggle that can come from its absence. When I suffered a stress fracture in my lower back a few years ago that left me unable to play baseball for the foreseeable future, I felt as if suddenly a major part of my identity had been stripped away. I struggled with this new reality for a while until I realized I could fill this temporary void by acting as a mentor for my younger teammates. Additionally, with my newfound spare time, I was able to further develop my interest in Mu Alpha Theta, which gave me a new, enriching opportunity to compete in mathematics competitions. By the time I was finally cleared to play, I had developed a fresh appreciation for the importance of maintaining a balance among all the activities I did, as I had experienced firsthand the empty feeling of having this balance stripped away.

While putting the finishing scallions in the bowl, I reflected on the delectable meal I helped create and realized that what had started out as me simply wanting to learn more about my heritage became something more poignant: an introspection. Although there may not be a single perfect recipe for pho, by applying my grandma's cooking principles in my everyday life, whether it be in baseball, my volunteer lab experience, or my service trip to Guatemala, I hope to be able to make a "bowl of pho" that is perfect for me.`,
    tips: [
      "Anchor every abstract claim ('balance', 'foundation') in a concrete sensory image.",
      "Connect heritage to action — show how a cultural lesson plays out in your real life.",
      "End on integration, not summation.",
    ],
  },
  {
    id: "harvard-barry",
    school: "Harvard",
    schoolColor: "hsl(0 70% 40%)",
    year: 2023,
    studentName: "Barry",
    promptType: "challenge",
    promptLabel: "Challenge — adversity & resilience",
    themes: ["poverty", "loss", "resilience", "education", "family"],
    hookStrategy: "In-scene chaos — siblings fighting over porridge — establishes stakes immediately.",
    structure: "Chaos → mother's quiet strength → father's death → mother's death → resurrection through education.",
    emotionalArc: "Survival → grief → near-collapse → defiant rebirth.",
    whyItWorked: "The writing is unpolished in places, but its specificity, emotional restraint, and refusal to perform victimhood make it unforgettable. 'I died with her' lands harder than any rhetorical flourish would.",
    body: `I woke up one morning to the usual noise in the kitchen. "That plate of porridge is mine," my brother yelled outrageously at my sister, "leave it or else I will beat you up." Food scrambles and fights were order of the day in the family I was raised. The size of one's meal would be determined by one's age. You had to fight for food at times, or else hunger would eat you alive. Living with ten siblings in a polygamous family is not the definition of tranquility. However, I have learned more from this revolving door than I could have been taught in solitary silence. Beyond chaos, there is a whisper that teaches the benefits of unselfish concern.

My mother was a teacher, but her salary could not sustain the big family. Almost every day, she would wake up early in the morning before work and go to the fields. My parents were shadowy figures whose voices I heard vaguely in the morning when sleep was shallow, and whom I glimpsed with irresistibly heavy eye-lids as they trudged wearily into the house at night. We sat together as a whole family on special occasions. After a bumper harvest, my parents would sell their crops in the neighborhood. I vividly remember my mother counting proceeds from the crop sale, her dark face grim, and I think now, beautiful. Not with the hollow beauty of well-simulated features, but with a strong radiance of one who has suffered and never yielded.

My father instilled in me the importance of education. I would see the value of education every time I shook hands with him; the scratches and calluses from the field in his hands were enough motivation. After every award I received, he would firmly shake my hands as a sign of profound pride. My tacit prayer was to ease his pain one day. Unfortunately this was never to come true, he died on 5 February 2016 in a car accident, only a week before I received my IGCSE O LEVEL results and I had attained 14 straight A grades, standing out to be one of the top performers in the country. After my father's death, his brothers took everything that he had acquired.

Inevitably, circumstances forced me to take a break from school in January 2017 and bear my share of the eternal burden at home. I had to take care of my mother whose health was deteriorating. I would spend the day doing household chores, and the nights were times of intensive study. It was on my mother's deathbed when I was fully convinced that she was a seasoned fighter. "Barry," she called me, "I am not going to die till you finish school." In order not to disillusion that extraordinary faith in her voice, I assured her that she was going to live. Unfortunately, she succumbed to death on the 15th of March 2017. I "died" with her.

Already laid waste by poverty and pain, I went back to school through the generosity of strangers. School became a battleground for victory. I came back to life determined than ever before. I out-performed the country boys who mocked my struggle. I went on to win accolades in the National and Regional Mathematics Olympiads and was awarded the Higher Life Foundation Scholarship that was going to pay my fees throughout high school.

Today, I am an epitome of a black, double-orphaned, African boy who lost everything he ever valued, but refused to give up on his dream.`,
    tips: [
      "Adversity essays land hardest when the writer refuses to ask for sympathy.",
      "Specificity (dates, exam names, scholarship names) anchors otherwise huge emotional claims.",
      "End with identity, not a moral.",
    ],
  },
  {
    id: "harvard-claire-crocs",
    school: "Harvard",
    schoolColor: "hsl(0 70% 40%)",
    year: 2024,
    studentName: "Claire (Yellow Crocs)",
    promptType: "topic",
    promptLabel: "Topic — symbol of identity",
    themes: ["activism", "leadership", "visibility", "self-expression"],
    hookStrategy: "Quirky symbol (bright yellow Crocs) telegraphs voice and self-awareness instantly.",
    structure: "Object purchase → first protest → founding TVP → reflection on visible leadership.",
    emotionalArc: "Indecision → courage → action → philosophy of leadership.",
    whyItWorked: "Turns a frivolous object into a serious metaphor for visible, joyful leadership. Voice is confident and humorous without performing.",
    body: `Of the memorable moments in my life when I have discovered one of my passions, almost all of them involve my bright yellow Crocs. Buying rubber shoes in such a conspicuous color was not a spontaneous decision; it took me two months to choose. I had been stalking crocs.com, clicking between the color options, and asking for the unsatisfying opinions of friends before what felt like my rom-com "meet cute" moment: a girl wearing a black tracksuit walked past me in Crocs the brightest shade of yellow I had ever seen. That very week, I opened my laptop and decisively purchased a size 8 pair of "Lemon" Crocs.

I was wearing my Crocs when I recognized the importance of activism in young communities. This revelation came on a Saturday in March 2018. I took a 25-minute train ride down to Washington D.C. to participate in the March for Our Lives rally—my first protest. For all 25 anxiety-inducing minutes, my heart raced and my muscles tightened as I tried to ignore the probing stares from strangers wondering why I decided to pair yellow shoes with a green coat.

But my fears (both Croc and non-Croc related) quickly dissolved as I stood alongside activists that were my age; in front of a stage dominated by leaders that were my age; making me realize that the only thing stopping me from being a student activist, at my age, was effort. The young voices calling for change inspired me to step into my responsibility to use my voice to help those whose voices are being suppressed. So, five months later, I co-founded The Virago Project (TVP), a student-led organization focused on building a community of activists like the ones I stood alongside in March. A "virago" is a woman displaying exemplary qualities, but the term has been twisted to demean assertive women. From its name to its activities, TVP is about redefining leadership.

After my day in D.C., I wore my Crocs to every student meeting TVP held. I wore them as we sold 150 handmade bracelets to raise funds for a local children's home and again when we posted colorful cards with encouraging messages all over my high school. Walking into rooms full of ambitious student leaders using TVP as a jumping-off point for their own service projects, I beamed as their gaze met my sunny shoes and then shot up to my equally cheery smile.

"Dunni, why do you wear such noticeable shoes when you lead these meetings?" asked one of our activists.

I wear such noticeable shoes when I stand in front of other student leaders because I want to model the kind of leadership that is as smile-inducing, deliberate, and visible as my Crocs. TVP has trained me to be, above all, altruistic, and I love that I get to learn and model this with a generation of world changers. It took me two months to decide I wanted a pair of sun-colored shoes but only two seconds and a model to realize that I desired the option I'd once overlooked. Now, I realize that, to curious strangers, I am the girl walking past in Crocs the brightest shade of yellow they have ever seen. And I am delighted with the thought that I could be the one to break someone's cycle of indecision and social apathy.`,
    tips: [
      "A 'small' object can carry an enormous theme if you commit fully.",
      "Humor and self-awareness are the real signal — not the activism on its own.",
      "Let the object reappear in different scenes to do the structural work.",
    ],
  },
  {
    id: "harvard-isabelle",
    school: "Harvard",
    schoolColor: "hsl(0 70% 40%)",
    year: 2023,
    studentName: "Isabelle",
    promptType: "topic",
    promptLabel: "Topic — symbol & growth",
    themes: ["identity", "spontaneity", "leadership", "dance"],
    hookStrategy: "'I was a plain bagel girl through and through.' Owns a quirky self-definition out of the gate.",
    structure: "Plain bagel persona → egg bagel epiphany → dance leadership → integrated self.",
    emotionalArc: "Control → discomfort → discovery → balanced identity.",
    whyItWorked: "Distills character into a single playful image and uses it to track real growth. Light surface, real depth.",
    body: `Breakfast after church is a Sunday staple in my family. We're not allowed to eat beforehand, so right after Mass ends, my sister and I race to the bagel shop only to inevitably wait in a long line. Often when we reached the cashier, we'd find they were out of plain bagels. It was a perennially difficult decision: pick from an assortment of non-plain bagels, or wait another 20 minutes for new plain bagels.

People's bagel choices tell you everything about them, and I was a plain bagel girl through and through. Even when faced with 20 extra minutes of hunger, I decided to leave the sweet bagels for the adventurous, the savory for the straightforward, and the "everything" for the indecisive. I came for plain bagels, and I would get them, no matter the wait.

After a long wait, the warmth of the freshly-baked plain bagels radiating through the paper bag assured me my patience was worth it. Being a plain bagel girl means knowing exactly what you want—no more, no less.

In senior year, my teacher graciously brought bagels to our class. Upon approaching the bag, however, I found there were no plain bagels left. Instinctively, I retreated. But my teacher stopped me and advised that I break from my comfort zone. Reluctantly, I chose an egg bagel, preferring its odd yellow shade to the surrounding sweeter variety. My first bite introduced me to a new world: this sweet and savory egg bagel flawlessly balanced the worlds of the adventurous and the straightforward.

My willingness to try an egg bagel didn't lead to a phase of food experimentation, but it did make me see that I could be more spontaneous than my plain bagel self might allow. Before high school, you could never spot me on a dance floor; I much preferred to watch from the audience. But in my freshman year, I joined the dance department of my school's annual production of S!NG on a whim. As soon as I tried the first move, I knew the decision was worth it. Eventually, I excelled so much that the directors chose me as their successor—a position that has strengthened me as a dancer, leader, and person. I tirelessly choreographed and re-choreographed each step and count of a routine. During practices, I analyzed the dancers' movements and refined them to what could only be described as plain bagel perfection.

Sometimes the moments when I thought I needed to be in control to be successful were when I needed to be more spontaneous. In my first year being director, shedding my fear of being an inexperienced leader was difficult, but I soon learned to open myself to others' advice. Together, through sometimes spontaneous practice sessions and spurts of inspiration, we worked to adapt the choreography to accommodate all dancers.

I revel in the contradiction that is my simultaneous meticulousness and spontaneity: my egg bagel epiphany. I can count on myself to prepare thoroughly to optimize my potential, no matter how long it takes. But I can also trust myself to make the most of the unknown and stay true to myself while doing so. It's what makes me multidimensional; it makes me a young woman no longer defined by her bagel choices but rather by her versatility and what she can do with it.`,
    tips: [
      "Pick a single quirky self-definition and let it earn its weight through scenes.",
      "Show the contradiction inside you — admissions wants dimensionality, not perfection.",
    ],
  },
  {
    id: "harvard-olivia",
    school: "Harvard",
    schoolColor: "hsl(0 70% 40%)",
    year: 2023,
    studentName: "Olivia",
    promptType: "background",
    promptLabel: "Background — science, family & meaning",
    themes: ["science", "family", "research", "service", "communication"],
    hookStrategy: "German word (Waldeinsamkeit) → grandfather lore → mystery of family silence.",
    structure: "Family memory → research path → outreach → revealed family history → unifying metaphor (forests talk).",
    emotionalArc: "Solitude → curiosity → discovery → connection.",
    whyItWorked: "Connects hard-science achievement to a redemptive family arc using one elegant metaphor (forests communicating). Impact + insight + identity all present.",
    body: `When I was little my grandfather taught me the German word Waldeinsamkeit, the feeling of being truly alone in a deep forest. "Forests are special in Germany," he explained. "In Florida...it's swamps," pointing to the brackish pond behind his house.

Back then, I knew only that he was a scientist, and that my mom's forehead furrowed when he was mentioned. It was years before I saw him again, and many more years before I learned that, despite the silence of forests and families, no one is truly alone.

I always felt that science was in my blood. In 8th grade, I attended the Summer Science and Engineering Program at Smith College. I left hoping to study Chemistry — that was what my grandfather had taught.

So in high school, I emailed dozens of labs… and received one positive response, from a plant lab. Plants? They didn't move or talk; they're boring, I thought. And I had accidentally killed every plant I'd touched — including a fake one I'd dropped. But Dr. Yanofsky encouraged me. He also taught me that most of what I'd assumed about plants was wrong.

New research suggests injured Douglas firs send distress signals to nearby pines through a series of mycorrhizae, a fungi which acts like a plant internet. In other words, trees "talk" to each other and are "friends" during hard times — they help injured trees by sharing resources. If we listen at the right frequency, we can literally hear forests communicating.

In Dr. Yanofsky's labs, I began using CRISPR-Cas9 to explore two genes in Arabidopsis thaliana. It took years, but my engineered plants produced nearly three times the fruit of the wildtype average, with clear applications toward world hunger. I entered my project in the Greater San Diego Science and Engineering Fair, where I won First Place and Sweepstakes, sending me to ISEF, where I became a Finalist.

That's why I helped launch the Student Leadership Board of GSDSEF. Traveling to dozens of schools, leading monthly Saturday workshops, I saw classrooms without science equipment. I met kids whose parents couldn't afford even modest science fair entry fees. So I created Science Fair Buddies, a mentoring program at a middle school where most students receive free lunch. I persuaded a local company to provide financial support, and recruited science fair alumni as mentors. I've learned to look and listen in ways I hadn't before. "Will there be snacks?" often means "I haven't had a meal today."

In the last year, in an awkward conversation, I learned my own mother was one of these kids. I learned my grandfather was an alcoholic. That she spent afternoons stranded at bus stops. That the swampy pond behind her house was her designated meeting spot for friends to comfort her.

Last year, we traveled across the country to bring him home to live with us. He was alone, and suffering from progressive dementia. Some days he speaks nonsense, asking for "blue noses" for lunch. But yesterday he said his hobby was "finding truth where it may not always be obvious."

Forests may be peaceful, but they're not lonely, or even silent. Trees — and people — are always sharing resources in ways that remind us we're never truly alone.`,
    tips: [
      "One scientific concept can do enormous metaphorical work — choose carefully.",
      "Family revelation is most powerful when it reframes what came before, not when it leads.",
      "Quiet endings beat dramatic ones when the body has earned the weight.",
    ],
  },
  {
    id: "harvard-jinna",
    school: "Harvard",
    schoolColor: "hsl(0 70% 40%)",
    year: 2024,
    studentName: "Jinna",
    promptType: "belief",
    promptLabel: "Belief — questioning your assumptions",
    themes: ["intellectual curiosity", "civics", "law", "disillusionment"],
    hookStrategy: "'Crises of faith are just a click away on Amazon.' Voice + irony in one line.",
    structure: "Belief → audiobook-driven dismantling → Socratic reframe → renewed purpose.",
    emotionalArc: "Idealism → disillusionment → liberation → hunger.",
    whyItWorked: "Shows a mind willing to update itself in public. The 'wisdom rock bottom' line reframes disillusionment as opportunity — exactly the intellectual posture top schools want.",
    body: `It's terrifying how much we can get from Amazon nowadays: groceries, clothes, books, and crises of faith are all just a click away.

After Audible thanked me for listening to The Most Dangerous Branch by David Kaplan and The Brethren by Bob Woodward and Scott Armstrong, I wanted to cry, scream, and march to Washington to shake answers from Chief Justice John Roberts.

My emotional whirlwind burst from the dichotomy between reality and my expectation of it. Growing up, I knew the judicial branch as the apolitical arbiter of constitutional law and the bias-blind defender of civil rights. With fear across the nation rising as fast as the global temperature, I was sure the best way to change the failing status quo was through the courts. I dreamed of becoming a lawyer to advocate for justice and to help my country prosper. My ambitions sprouted from the ideals of public service ingrained into me at school and at home, and my goal hinged only upon the judiciary's mandate to protect our freedoms. My dream was purposeful and straightforward.

But 37 hours of audiobook rewrote all my beliefs in the judicial branch.

The Supreme Court: apolitical arbiter and bias-blind defender? No. Rather: potentially politicized, petty, proud, and irrational. Partisan politics dance about the Justices' Conferences. Most rights supposedly afforded by the Constitution are interpretations, not explicit clauses, of it. Chief Justice Warren Burger manipulated case assignments, so Justice Potter Stewart tattled on him to Woodward and Armstrong in retaliation. The right of the judiciary to strike down laws deemed unconstitutional is derived more from Marbury v. Madison than from Article Three. Justice Harry Blackmun based his majority opinion in Roe v. Wade on the rights of the doctor to practice. Stare decisis is optional, as is judicial restraint.

I felt sick. I had worshipped the courts as the perfect forum for change, always upholding truth, equality, and scholarship; I saw them as the eventual birthplace of solutions to gun regulation, climate crises, gerrymandering, immigration, and social inequality. I did not want to acknowledge courts could be anything but perfect.

Desperation drove me to keep listening, but with every new case I covered, the clearer it became that I had worshipped an impossibility. After finishing Jeffrey Toobin's The Nine, I finally admitted that, prior to these books, I had known nothing. Perhaps that epiphany should have terrified me, but it did quite the opposite.

It was liberating.

Socrates once wrote that true knowledge was in knowing that you know nothing. I couldn't agree more: once you know you've hit wisdom rock bottom, you can be reckless with your curiosity because you only have everything to gain.

Since that epiphany, I have been gleefully chasing infinity. Even if my capacity to learn is finite, my curiosity is not. The history of the courts, the ethics of judicial restraint, the politics of judging, the rhetoric of opinions, the intersectionality of all of the above and more… there is so much to explore.

For the record: I purchased those audiobooks on a whim. I was not looking for anything more than a fascinating nonfiction read. But they have plunged me into an exhilarating, all-consuming, fully unpredictable adventure. While these books initially upset me by revealing the imperfections of the judicial branch, they showed me a whole undiscovered history and future at my fingertips. Rather than smothering my dreams of public service, they fanned the flames; now, my dream of public service is fueled by my passion to serve and to learn. And I'm ready to chase it.`,
    tips: [
      "Show what you used to believe — not just what you now know.",
      "Quote sources by name: it signals real engagement, not Wikipedia summary.",
      "Reframe disillusionment as fuel, never as victimhood.",
    ],
  },
  {
    id: "harvard-carrie",
    school: "Harvard",
    schoolColor: "hsl(0 70% 40%)",
    year: 2023,
    studentName: "Carrie",
    promptType: "challenge",
    promptLabel: "Challenge — trauma & healing",
    themes: ["trauma", "therapy", "vulnerability", "recovery"],
    hookStrategy: "Bold self-image — 'I am a seasoned architect of mental walls.' Establishes voice and metaphor immediately.",
    structure: "Self-image as walls → Mark (mentor) → game of HORSE → realization → controlled rebuilding.",
    emotionalArc: "Defense → exposure → trust → acceptance.",
    whyItWorked: "Doesn't seek pity. Reframes trauma through a single architectural metaphor and ends on growth, not closure. Vulnerable without being sensational.",
    body: `I am a builder. No. I am a seasoned architect. My tools are foreign to the realities of others but mundane by my standards. I don't compose the perplexing and unique structures that most think of when the word architect is mentioned. Matter of fact, I don't make structures at all; my mastery is in the assembly of walls. Mental ones, to be exact. I am a skillful artist of intricately woven walls to create a complex maze for the others that try to get to know me; they are left confused, with no choice but to surrender their arbitrary efforts to "save" me.

I was unmatched in my array of skills. That was until I met Mark. Mark was a worker from my first mental hospital visits who had attached himself to my conscience before I could push him away as I had done with so many others. With an equally impressive skill set, he was able to navigate his way through my long-standing labyrinth to its center. That's where he found me. Still crouched next to my fledgling wall, dirt on my knees with dust on my face, I had finally been figured out for the first time in years. The game that we always played. Horse. Such a benign game, that the thought of it having any significant part in my life is utterly incomprehensible. But it did, nonetheless.

Little did I know that Mark was studying to become a therapist in his studies of psychology, and I, his first patient. This is not a story of teenage love and life-changing heartbreak, but of one where an abandoned kid finally gets the parental figure that she was never offered before. I was an emotional wreck at this time, not wanting to live, much less fight a court battle to get the "justice" everyone so badly wanted for me. So Mark, the father I never got to have, taught me how to swim in the never-ending circumstances I was drowning in. With every swish of the net of our game, a new way he would teach my fumbling feet to move in the water. And with every finished game, he was one wall closer to the reality behind my facade. He taught me that being angry at my circumstances would not fix them or get me any closer to overcoming them.

Nothing is going to change my mom's decision. Nothing is going to turn back time and change what my dad did. I can be the ruler of the lonely maze I created, or I can be surrounded by people who love and care for me. It wasn't easy destroying all the walls I had taken years to build and perfect, but it wasn't impossible either. This isn't a fairytale where Mark waved a magic wand and all was better and my walls disappeared from my mind. This is reality, and it took time, patience, and effort to unassemble my walls. Brick by painstaking brick. Some of my walls are still there. And that's okay. I have learned to recognize my progress instead of singling out my flaws.

I am finally okay with not being perfect. My walls have chips and cracks, but I am content with their creation and their destruction. The destruction of familiarity is a beautiful thing. And so I climb out of the water, let the flowers bloom in the cracks of my walls, and walk off the court arm in arm with someone who sees me for who I am, not whom I pretend to be.`,
    tips: [
      "If you write about trauma, choose ONE governing metaphor and stay disciplined.",
      "Refuse the fairytale ending. Honest progress is more credible than full resolution.",
    ],
  },
  {
    id: "harvard-janna",
    school: "Harvard",
    schoolColor: "hsl(0 70% 40%)",
    year: 2024,
    studentName: "Janna",
    promptType: "topic",
    promptLabel: "Topic — environment as identity",
    themes: ["curiosity", "city vs nature", "growth", "balance"],
    hookStrategy: "Wakes up 'in monochrome' — surreal cinematic imagery pulls reader inside the writer's head.",
    structure: "Bedroom photograph → IKEA refresh → city ambition → plant invasion → equilibrium.",
    emotionalArc: "Restlessness → rebuild → cohabitation → integrated self.",
    whyItWorked: "Uses two opposing decor choices (NYC photo + houseplants) as a real metaphor for ambition + stability. Avoids cliché 'two sides of me' essays by anchoring everything in concrete objects.",
    body: `I wake up in monochrome. Just past the tips of my toes, the Flatiron Building rises above the bustling black and white streets of New York. Cars hurtle by in blurred gray tones. I am a hawk or helicopter or hot air balloon, and I have somehow worked myself into the sky of an Old Hollywood movie. Of course, this only lasts as long as I keep my eyes locked on the IKEA photograph I hung up across from my bed a few years back.

Just before I turned fourteen, I burst out of IKEA—my all-time favorite store—dead set on crafting a "new and improved" Helen. I rushed home, stripped my room, and launched my transformation. Out with the beaded golden comforter! Out with the floral rug! Out with the pastel prints of savanna animals!

Well, perhaps this is too dramatic. Items are rarely thrown out in the Krieger household, just put to another use. Gazelles and cheetahs now peer down at me from the hallway wall, and the floral carpet rests beneath the brass coffee table in the living room. As for the comforter, I still use the exact same one, just concealed by a stark white cover. Still, the meaning holds: I was ready to refocus.

Back then, I did not know what I wanted to be, and I still do not know now. However, never has there been any doubt in my mind about what I want to be doing. I want to whiz from idea to idea, question to question, and all the while, learn as much as possible. In all its action of rushing cars, the IKEA photograph epitomizes this ambition. No billion-dollar skyscraper or jewelry store in New York could ever win me over. I am not after Gatsby's gilded highlife, but New York's dynamic — the city's perpetual drive.

When I open my eyes, however, I am just as likely to wake up in a vibrant forest of green as I am to rise in the midst of charcoal city streets. Plants flourish on either side of my headboard. Vines of English ivy cascade down my bookcase, and a sentry palm fans out in front of my closet doors. New York reigns over one wall, but the other three are governed by nature.

This contrast did not always exist. Apart from the occasional bouquet, the Krieger household was void of vegetation until my sophomore year. One Saturday, my copper phytoremediation experiment made the breakfast table home to four groups of greenery. Over the next few months, I watched parts of my garden flourish, and then wilt, and then (remarkably) recover. Although all my plants were eventually reduced to a green juice of sorts for absorbance testing, they had started a revolution.

Soon after my experiment ended, I realized I missed my garden, and the plant invasion began. Today, my room harbors seventeen species, meshed into a diverse jungle. Just as I am captivated by the movement of the city, I admire the delicate hardiness of plants. Left untouched by humans, forests would cover most of the United States, and even in the midst of man-made destruction, many species still find a way to break through the cement.

In my room, plants and city streets share the stage. They do not battle, but exist in equilibrium, the gray with the green, urban acceleration in balance with the stability of nature. These worlds are not opposites. For all their differences, they share the energy of growth as well as the promise of regeneration and renewal. To thrive, I need not tear myself between manmade landscape and the natural environment; I need not pick between rapid action and natural growth.`,
    tips: [
      "Concrete objects (a poster, a houseplant) carry abstract themes more credibly than declarations.",
      "Two opposing forces inside one writer is a stronger essay than a single passion.",
    ],
  },
  {
    id: "berkeley-relay",
    school: "UC Berkeley",
    schoolColor: "hsl(220 80% 30%)",
    year: 2023,
    studentName: "Anonymous",
    promptType: "background",
    promptLabel: "Leadership & community impact",
    themes: ["interdependency", "loss", "community service", "leadership"],
    hookStrategy: "Big philosophical claim (interdependency) → personal grief → action.",
    structure: "Thesis → personal loss → catalyst story (Freddy the Leaf) → measurable action → reflection on legacy.",
    emotionalArc: "Detachment → grief → purpose → leadership identity.",
    whyItWorked: "Connects abstract civic philosophy to concrete numbers ($800 → $2,900, 30 → 95 members) and ties it back to private grief. UCs reward documented community impact + reflection.",
    body: `The phenomenon of interdependency, man depending on man for survival, has shaped centuries of human civilization. However, I feel, the youth of today are slowly disconnecting from their community. For the past few years, human connection has intrigued me and witnessing the apathy of my peers has prompted me to engage in various leadership positions in order to motivate them to complete community service and become active members of society.

Less than a year before ninth grade began, my cousin and close friend passed away from cancer, and in the hodge-podge of feelings, I did not emotionally deal with either death. However, a simple tale helped me deal with these deaths and take action.

I was never fully aware of how closely humans rely upon each other until I read The Fall of Freddy the Leaf by Leo Buscaglia in freshman year. The allegory is about a leaf that changes with the seasons, finally dying in the winter, realizing that his purpose was to help the tree thrive. After reading it, I was enlightened on the cycle of life and realized the tremendous impact my actions had on others.

Last year, I joined the American Cancer Society's Relay for Life, a twenty-four-hour relay walk-a-thon designed to raise funds for cancer research. I started a team at school, gathered thirty students and chaperones, and raised $800 for the cause. This year, I led a team in the Relay for Life again with the schoolwide team of 95 members, and we raised $2,900 for the cure for cancer. At first the group leadership consisted of only my advisor and me; however, I gained the support of the administrators. I spent well over an hour a day preparing for the event, and it was all worth it!

The Sonora Eagles were students of different grade levels, ethnicities, socioeconomic backgrounds, and educational ability. The most important moment occurred during the night's luminaria ceremony, during which cancer patients of the past and present were commemorated. Our whole team gathered around, and I asked people to share how they have been affected by cancer. As I went through the crowd, their faces illuminated by candlelight, their cheeks wet with cleansing tears, I realized the impact I had on them, the purpose I was fulfilling; but most importantly, I realized the impact they had had on me. The Sonora Eagles were my means for dealing with the death of my loved ones to cancer.

The theme for Relay for Life is a hope for a cure. Through this experience as a leader, I have come to realize, as a community, we hope together, we dream together, we work together, and we succeed together. This is the phenomenon of interdependency, the interconnectedness of life, the pivotal reason for human existence. I have continued this momentum by starting a Sonora High School chapter of American Cancer Society Youth, a club dedicated to youth involvement and several aspects of the American Cancer Society, including the recent Arizona Proposition 45.

Each one of us leaves behind a legacy as we fulfill our purpose in life. I believe my purpose as a student is to encourage others to become active community members and motivate them to reach new heights. As a student of the University of California, I will contribute my understanding of the human condition and student motivation to help strengthen student relationships within the campus and throughout the community.`,
    tips: [
      "UC essays love measurable growth — show year-over-year numbers.",
      "Pair a public action (fundraising) with a private reason (grief). The contrast does the work.",
    ],
  },
  {
    id: "cornell-locker",
    school: "Cornell",
    schoolColor: "hsl(0 70% 35%)",
    year: 2023,
    studentName: "Anonymous",
    promptType: "topic",
    promptLabel: "Topic — symbol-driven self-portrait",
    themes: ["travel", "research", "curiosity", "identity"],
    hookStrategy: "Tactile sensory open — locker dial under fingers — reveals method (objects = story) before content.",
    structure: "Open the locker → pick up object 1 (Flamenco magnet) → object 2 (Santa Barbara) → object 3 (motto). Tight three-beat artifact essay.",
    emotionalArc: "Curiosity → discovery → resolve.",
    whyItWorked: "An artifact essay where each object earns its place. The 'Live the Life You Imagine' close avoids cliché because it's anchored in two concrete prior scenes.",
    body: `My fingers know instinctively, without a thought. They turn the dial, just as they have hundreds of times before, until a soft, metallic click echoes into my eardrum and triggers their unconscious stop. I exultantly thrust open my locker door, exposing its deepest bowels candidly to the wide halls of the high school. The bright lights shine back, brashly revealing every crevice, nook, and cranny. On this first day of senior year, I set out upon my task. I procure an ordinary plastic grocery bag from my backpack. The contents inside collectively represent everything about me in high school — they tell a story, one all about me.

I reach in and let my fingers trail around the surfaces of each object. I select my first prey arbitrarily, and as I raise my hand up to eye level, I closely examine this chosen one. A miniature Flamenco dancer stares back at me from the confines of the 3-D rectangular magnet, half popping out as if willing herself to come to life. Instantly, my mind transports me back a few summers before, when I tapped my own heels to traditional music in Spain. I am reminded of my thirst to travel, to explore new cultures utterly different from my familiar home in Modesto, California. I have experienced study abroad in Spain, visited my father's hometown in China five times, and traveled to many other places such as Paris. As a result, I have developed a restlessness inside me, a need to move on from four years in the same high school, to take advantage of diverse opportunities whenever possible, and to meet interesting people.

I take out the next magnet from my plastic bag. This one shows a panoramic view of the city of Santa Barbara, California. Here, I recall spending six weeks in my glory, not only studying and learning, but actually pursuing new knowledge to add to the repertoire of mankind. I could have easily chosen to spend my summer lazing about; in fact, my parents tried to persuade me into taking a break. Instead, I chose to do advanced molecular biology research at Stanford University. I wanted to immerse myself in my passion for biology and dip into the infinitely rich possibilities of my mind. This challenge was so rewarding to me, while at the same time I had the most fun of my life, because I was able to live with people who shared the same kind of drive and passion as I did.

After sticking up my magnets on the locker door, I ran my fingers across the bottom of the bag, and I realized that one remained. It was a bold, black square, with white block letters proclaiming my motto, "Live the Life You Imagine." In my four years at Cornell University, I will certainly continue to live life as I imagine, adding my own flavor to the Cornell community, while taking away invaluable experiences of my own.`,
    tips: [
      "Three-object structures are tight and memorable — pick objects that don't repeat the same trait.",
      "End with a school name only if you've earned it through specifics earlier.",
    ],
  },
  {
    id: "northwestern-stanford-summer",
    school: "Northwestern",
    schoolColor: "hsl(280 50% 35%)",
    year: 2023,
    studentName: "Anonymous",
    promptType: "topic",
    promptLabel: "Topic — intellectual curiosity",
    themes: ["research", "ambition", "curiosity", "travel"],
    hookStrategy: "Wintertime planning scene → contrast with summer's eventual setting (palm trees in Palo Alto).",
    structure: "Plan → arrival scene → motivation → community → reflection on choice.",
    emotionalArc: "Restlessness → commitment → fulfillment.",
    whyItWorked: "Owns the choice (research over rest) without bragging. Repeats the 'I could have lazed about' beat to underline self-direction.",
    body: `As I sip a mug of hot chocolate on a dreary winter's day, I am already planning in my mind what I will do the next summer. I briefly ponder the traditional routes, such as taking a job or spending most of the summer at the beach. However, I know that I want to do something unique. I am determined to even surpass my last summer, in which I spent one month with a host family in Egypt and twelve days at a leadership conference in New York City. The college courses I have taken at Oregon State University since the summer after 7th grade will no longer provide the kind of challenge I seek.

Six months later, I step off the airplane to find myself surrounded by palm trees, with a view of the open-air airport. I chuckle to myself about the added bonus of good weather, but I know I have come to Palo Alto, California, with a much higher purpose in mind. I will spend six weeks here in my glory, not only studying and learning, but actually pursuing new knowledge to add to the repertoire of mankind. Through the Stanford Institutes of Medicine Summer Research Program, I will earn college credit by conducting original molecular biology research, writing my own research paper, and presenting my findings in a research symposium.

I decided to spend my summer doing research because I knew that I liked scientific thought, and that I would passionately throw myself into any new challenge. I always want to know more — to probe deeper into the laws of the universe, to explore the power and beauty of nature, to solve the most complicated problems. I have an insatiable curiosity and a desire to delve deeper down in the recesses of my intellect. At the Summer Research Program, I found out how much I enjoy thinking critically, solving problems, and applying my knowledge to the real world.

While pursuing research in California, I was also able to meet many similarly motivated, interesting people from across the United States and abroad. As I learned about their unique lifestyles, I also shared with them the diverse perspectives I have gained from my travel abroad and my Chinese cultural heritage. I will never forget the invaluable opportunity I had to explore California along with these bright people.

I could have easily chosen to spend that summer the traditional way; in fact, my parents even tried to persuade me into taking a break. Instead, I chose to do molecular biology research at Stanford University. I wanted to immerse myself in my passion for biology and dip into the infinitely rich possibilities of my mind.`,
    tips: [
      "If your essay is about choosing the harder summer, name what you turned down.",
      "Describe community, not just achievement — admissions wants to see you among peers.",
    ],
  },
  {
    id: "yale-adhd",
    school: "Yale",
    schoolColor: "hsl(220 70% 35%)",
    year: 2024,
    studentName: "Anonymous",
    promptType: "challenge",
    promptLabel: "Challenge — diagnosis & advocacy",
    themes: ["learning disability", "self-advocacy", "race & medicine", "future lawyer"],
    hookStrategy: "Quiet confession (\"I was a straight A student until…\") → escalating doctor visits → courtroom-style proof.",
    structure: "Symptoms → dismissal → research with librarian → diagnosis → systemic discrimination → reframe.",
    emotionalArc: "Self-doubt → vindication → mastery.",
    whyItWorked: "Turns a diagnosis story into a procedural about evidence-gathering and bias. The bookend (\"You're going to be a great lawyer\") earns the future-self claim.",
    body: `I was a straight A student until I got to high school, where my calm evenings cooking dinner for my siblings turned into hours watching videos, followed by the frantic attempt to finish homework around 4 am. When I got an F on a chemistry pop quiz my mom sat me down to ask me what was happening. I told her I couldn't focus or keep track of all my materials for classes. I thought she would call me lazy, accuse me of wasting the gift of being an American that she and my father gave me. Instead, she looked around at the walls covered in sticky notes, the index cards scattered on the computer desk, the couch, the table, and she said, "How are your friends managing it?"

It turned out while my peers were struggling to juggle the demands of high school it didn't seem like they were working as hard to complete simple tasks. They only had to put things in a planner, not make sure the deadlines were placed in multiple locations, physical and digital. At my next doctor's appointment my mom mentioned that I had a learning problem, but the doctor shook his head and said that I didn't seem to have ADHD. I was just procrastinating, it's natural.

My mom took off from her grocery store job to take me to two more appointments to ask about ADHD, but other doctors were not willing to listen. I had As in every class except for World Literature. But I knew something was wrong. After our third doctor visit, I worked with the librarian after school to sift through research on ADHD and other learning disabilities until we came across the term executive functioning. Armed with knowledge, we went to a new doctor, and before my mom could insist that we get testing or get referred to a specialist, the doctor handed us a signed referral. She asked me about the folder in my hand. I told her it was full of my research. My mom mentioned that some doctors had refused to refer us to a specialist because my grades were too high. "It's because we're Asian," she added.

I was shocked at this revelation. The last three doctors had mumbled something about grades but had never said a thing about race. Before I could deny it fervently, the doctor, who was from Taiwan, nodded sympathetically. She said it's common to miss learning disabilities among different races due to biases. And some adolescents learn to mask symptoms by building systems. "You don't have to prove anything to me. I believe you should get tested." My mom thanked her fervently and the doctor said to her, "She's going to be a great lawyer."

The semester following the confirmation of my learning disability diagnosis was challenging to say the least. My school switched me out of all of my IB courses to "accommodate my special needs," and I went back to the library, working with the librarian with numerous index cards and stacks of books to make a case for discrimination. The librarian, who had become my close confidante, introduced me to an academic tutor who specialized in learning disabilities and taught me skills like using redundancy and time management. He noted that with ADHD, the problem wasn't always the inability to focus but rather the difficulty focusing without adequate perceived reward. This reframe changed my life, and when I came back to the library with my new schedule in hand, the most advanced courses my school had to offer, the librarian said, "You're going to make a great lawyer."

I smiled and said, "I've heard that before."`,
    tips: [
      "Bookended dialogue is a quiet, powerful structural move.",
      "Show the systemic context (race, bias) as observed reality — not as a thesis.",
    ],
  },
  {
    id: "washu-garden",
    school: "WashU",
    schoolColor: "hsl(40 80% 35%)",
    year: 2024,
    studentName: "Anonymous",
    promptType: "topic",
    promptLabel: "Topic — service & communication",
    themes: ["gardening", "disability", "communication", "service"],
    hookStrategy: "Slow tactile open — planting lettuce — earns the philosophical close.",
    structure: "Scene → personal meaning → friendship with Brian → philosophy of communication.",
    emotionalArc: "Calm → connection → insight.",
    whyItWorked: "Avoids a savior narrative. Brian is the teacher; the writer is the student. The unspoken-language thread is genuinely earned.",
    body: `I held my breath as my steady hands gently nestled the crumbly roots of the lettuce plant into the soil trench that I shoveled moments before. Rainwater and sweat dripped from my brow as I meticulously patted and pressed the surrounding earth, stamping the leafy green creature into its new home. After rubbing the gritty soil off of my hands, I looked at Brian, a co-volunteer and nonverbal 20-year-old with autism, who extended his arm for a high-five. In the year that I've been working with him, I've watched him revel in planting, nurturing, and eventually harvesting his veggies, especially the grape tomatoes, which we enjoy eating fresh off the vine!

My love for gardening began when I moved to Georgia during my sophomore year. In the time I've spent learning how to garden, I've developed an affinity for watching my vegetables grow to maturity, eager to be harvested and sold at the Saturday market. Though many see gardening as tedious busywork, I find it meditative, as I lose track of time while combining peat moss and soil in the garden's compost mixer. Saturday morning garden work has become a weekend ritual, ridding me of all extraneous responsibilities. My body goes into autopilot as I let my mind wander. Sometimes, it's the physics midterm that suddenly seems less daunting or the deadlines I need to meet for my Spanish project that push back farther. Other times, I contemplate alternative endings to conversations or make perfect sense of the calculus answer that was at the tip of my tongue in class.

I met Brian, a close friend of mine who also basks in the tranquility of nature, through my gardening endeavors. While we aren't able to communicate verbally, we speak the language of earth, water, peat, and seedlings. He doesn't speak with words, but his face tells stories of newly found purpose and acceptance, a pleasant contrast to the typical condescension and babying he feels by those who don't think he's capable of independent thought.

Throughout my time in the garden with Brian, I began to understand that he, like everyone, has a particular method of communicating. There are the obvious spoken languages, body languages, facial expressions, and interactions we share on a day-to-day basis. Brian expresses himself through various manifestations of unspoken language that he uses to signal how he feels or what he wants. But the nuanced combinations of different methods of communicating are oftentimes overlooked, raising a barrier to mutual understanding that prevents one from being capable of truly connecting with others. I began to understand that in order to reach people, I have to speak in their language, be it verbally or otherwise.

Working with Brian over the past year has made me more aware that people can have difficulty expressing themselves. I found that I can positively lead people if I can communicate with them, whether on the track or in my Jewish youth group discussions. As I move into the next phases of my life, I hope to bring these skills with me because, in order to effectuate positive change in my community, I learned that I must speak in the language of those around me. Those are the words Brian taught me.`,
    tips: [
      "Service essays land when the other person is the teacher, not the project.",
      "Use the physical activity (gardening) as the carrier of the abstract idea (communication).",
    ],
  },
  {
    id: "brown-freefall",
    school: "Brown",
    schoolColor: "hsl(20 70% 30%)",
    year: 2024,
    studentName: "Anonymous",
    promptType: "challenge",
    promptLabel: "Challenge — identity & discomfort",
    themes: ["queer identity", "family", "discomfort", "vulnerability"],
    hookStrategy: "Skydiving metaphor → grounded immediately in a scene with mom at a restaurant.",
    structure: "Free-fall image → coming-out scene → observations of others' discomfort → philosophical pivot → choice to keep eyes open.",
    emotionalArc: "Fear → silence → reflection → resolve.",
    whyItWorked: "Doesn't resolve the conflict. The honesty of 'still falling' makes the philosophical claim about discomfort believable instead of triumphant.",
    body: `It felt like I threw myself out of a plane without a parachute. My eyes firmly shut, I feared for my life as I plummeted towards the ground. In hindsight, perhaps half coming out at a public restaurant wasn't the brightest idea. Then again, living as the half-closeted queer kid meant that I was all too familiar with intimidating situations.

I asked my mom: "What would you do if I had a girlfriend?" She instantly replied that she couldn't understand. Immediately, my heart dropped and the emotional free fall began. She explained that Americans choose to be gay for personal enjoyment, which in my Korean culture is an attitude that is severely frowned upon. I sat there like a statue, motionless and afraid to speak, blindly hurtling towards a hard reality I hadn't expected. Rejection cut me deeply and I started to feel the itch of tears welling in my eyes, yet I had to contain myself. I couldn't let the pain seep through my facade or else she would question why I cared. All I could do was keep looking down and shoveling food into my mouth, silently wishing I could just disappear. That night, I realized it would be a long time before I could fully come out to my mom. My eyes tightened as I continued to fall.

In the following weeks, I started noticing how discomfort played a natural part in my life. I recognized the anxious reactions of my classmates as I argued with my Christian friends when they said my queerness is a sin. I observed the judgmental glances my mentors gave me as I passionately disagreed with my conservative lab mates over my sister's abortion. Eventually, my friends decided to censor certain topics of discussion, trying to avoid these situations altogether. I felt like vulnerability was the new taboo. People's expressions and actions seemed to confine me, telling me to stop caring so much, to keep my eyes closed as I fall, so they didn't have to watch.

Had others felt uncomfortable with me in the same way I had felt uncomfortable with my mom? Do they feel that our passions might uncover a chasm into which we all fall, unsure of the outcome?

Perhaps it was too raw, too emotional. There was something about pure, uncensored passion during conflict that became too real. It made me, and the people around me, vulnerable, which was frightening. It made us think about things we didn't want to consider, things branded too political, too dangerous. Shielding ourselves in discomfort was simply an easier way of living.

However, I've come to realize that it wasn't my comfort, but rather, my discomfort that defined my life. My memories aren't filled with times where life was simple, but moments where I was conflicted. It is filled with unexpected dinners and unusual conversations where I was uncertain. It is filled with the uncensored versions of my beliefs and the beliefs of others. It is filled with a purity that I shouldn't have detained.

Now, I look forward to tough conversations with a newfound willingness to learn and listen, with an appreciation for uncertainty. I urge others to explore our discomfort together and embrace the messy emotions that accompany it. Since that dinner, my relationship with my mother is still in free fall. It's dangerous and frightening. Thankfully, the potentially perilous conversations I've had with my friends has given me a newfound appreciation for my own fear. I'll admit, part of me still seeks to close my eyes, to hide in the safety I'll find in silence. Yet, a larger part of me yearns to embrace the dangers around me as I fall through the sky. I may still be falling, but this time, I will open my eyes, and hopefully steer towards a better landing for both my mom and me.`,
    tips: [
      "Don't resolve what isn't resolved. Honest open endings can be the strongest move.",
      "A controlling metaphor (free fall) only works if you commit to it across every section.",
    ],
  },
];

export const ESSAY_SCHOOLS = [
  { name: "Harvard", color: "hsl(0 70% 40%)", count: ESSAYS.filter(e => e.school === "Harvard").length },
  { name: "Stanford", color: "hsl(0 75% 40%)", count: ESSAYS.filter(e => e.school === "Stanford").length },
  { name: "Yale", color: "hsl(220 70% 35%)", count: ESSAYS.filter(e => e.school === "Yale").length },
  { name: "MIT", color: "hsl(0 60% 40%)", count: ESSAYS.filter(e => e.school === "MIT").length },
  { name: "UPenn", color: "hsl(212 90% 35%)", count: ESSAYS.filter(e => e.school === "UPenn").length },
  { name: "Duke", color: "hsl(220 90% 35%)", count: ESSAYS.filter(e => e.school === "Duke").length },
  { name: "UC Berkeley", color: "hsl(220 80% 30%)", count: ESSAYS.filter(e => e.school === "UC Berkeley").length },
  { name: "Cornell", color: "hsl(0 70% 35%)", count: ESSAYS.filter(e => e.school === "Cornell").length },
  { name: "Northwestern", color: "hsl(280 50% 35%)", count: ESSAYS.filter(e => e.school === "Northwestern").length },
  { name: "WashU", color: "hsl(40 80% 35%)", count: ESSAYS.filter(e => e.school === "WashU").length },
  { name: "Brown", color: "hsl(20 70% 30%)", count: ESSAYS.filter(e => e.school === "Brown").length },
];
