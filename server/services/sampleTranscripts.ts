export interface SampleEpisode {
  id: string;
  url: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  durationEstimate: string;
  description: string;
  transcript: Array<{ text: string; offset: number; duration: number }>;
}

export const SAMPLE_EPISODES: Record<string, SampleEpisode> = {
  'agents-deep-dive': {
    id: 'agents-deep-dive',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // reference link
    title: 'The Architecture of Autonomous AI Agents: Beyond Simple Prompting',
    author: 'Next Frontier Tech & AI Podcast',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    durationEstimate: '42:15',
    description: 'A deep-dive conversation exploring why AI agents represent a fundamental shift from chat interfaces to multi-step reasoning, tool execution, and memory persistence.',
    transcript: [
      { offset: 0, duration: 25, text: "Welcome back to Next Frontier. Today we are breaking down why 2026 is the year of autonomous AI agents and why prompt engineering as we knew it is dead." },
      { offset: 25, duration: 30, text: "Everyone spent the last three years treating large language models like interactive search boxes or text autocomplete. But that was just phase zero." },
      { offset: 55, duration: 40, text: "When you look at true agentic workflows, the model isn't just generating an answer in one shot. It is planning, evaluating its own reasoning, calling APIs, catching errors, and persisting state across sessions." },
      { offset: 95, duration: 35, text: "Let's define the core distinction: a chatbot responds to what you say right now. An agent takes a high-level goal, decomposes it into five sub-tasks, executes them sequentially, and reports back when finished." },
      { offset: 130, duration: 45, text: "Think about customer support or podcast repurposing. A human creator spends four hours listening, making notes, writing tweets, formatting newsletters, and cutting clips. An agentic pipeline can do eighty percent of that heavy lifting in thirty seconds." },
      { offset: 175, duration: 40, text: "The biggest bottleneck right now isn't the intelligence of the model. It's the execution boundary. How do we give agents deterministic tools without hallucinated actions?" },
      { offset: 215, duration: 50, text: "We found that giving models structured output schemas—like strict JSON—drops failure rates by ninety percent. If the model can only emit validated JSON, the downstream runtime never breaks." },
      { offset: 265, duration: 45, text: "Another huge lesson: human-in-the-loop is not a temporary crutch; it is an architectural feature. The best systems don't auto-publish blindly. They prepare the draft, surface the critical decisions, and let the human director make the call." },
      { offset: 310, duration: 40, text: "Let's talk about multi-platform content distribution. If you publish a sixty-minute podcast, only two percent of your potential audience will ever sit through the entire video." },
      { offset: 350, duration: 50, text: "Ninety-eight percent of people encounter your ideas through a LinkedIn breakdown, an X thread, or a thirty-second highlight reel. Solo creators simply burn out trying to maintain all four channels manually." },
      { offset: 400, duration: 45, text: "When repurposing content, you cannot just copy-paste the transcript into Twitter. Twitter requires high-tension hooks and rapid payoff. LinkedIn requires professional narrative framing and career takeaways. Instagram needs punchy storytelling." },
      { offset: 445, duration: 55, text: "The magic happens when you extract the peak emotional or intellectual moments—the exact five-minute stretch where the guest dropped a counter-intuitive truth. That is where high-performing short-form video hooks are born." },
      { offset: 500, duration: 40, text: "To summarize today's playbook: First, structure your inputs. Second, enforce typed schema contracts. Third, design platform-native adaptations rather than lazy copy-paste. And fourth, always preserve the creator's editorial control." },
      { offset: 540, duration: 30, text: "Thank you for tuning into Next Frontier. Subscribe for next week's masterclass on real-time multi-modal systems." }
    ]
  },
  'startup-mvp-playbook': {
    id: 'startup-mvp-playbook',
    url: 'https://www.youtube.com/watch?v=1bZ_Q0n4BqU',
    title: 'How to Build an MVP in 2026: Fast, Focused, and Scalable',
    author: 'Founders Studio & Tech Labs',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80',
    durationEstimate: '34:20',
    description: 'Founders discuss the modern playbook for shipping an MVP: solving one painful problem for one persona, avoiding premature complexity, and validating with real users.',
    transcript: [
      { offset: 0, duration: 30, text: "The number one reason startups fail in their first six months isn't bad technology—it's building three times more features than the customer actually asked for." },
      { offset: 30, duration: 35, text: "Today we are dissecting what an MVP truly means in 2026. With modern AI tools and full-stack frameworks, shipping software is 10x faster. But finding product-market fit is still just as difficult." },
      { offset: 65, duration: 40, text: "Rule number one of an MVP: You are testing a hypothesis, not showing off your technical vanity. If your hypothesis is 'podcasters struggle to repurpose their audio', test only that." },
      { offset: 105, duration: 45, text: "Do not build multi-tenancy, custom team billing, social OAuth, and an analytics suite before you have ten people loving the core output of your pipeline." },
      { offset: 150, duration: 50, text: "The magic formula is: One core input, one transformation, and one immediate delight. In our case, URL goes in, structured show notes and platform assets come out." },
      { offset: 200, duration: 40, text: "Speed to value is everything. If a user pastes a link and has to click through five onboarding screens and fill out a survey, seventy percent will drop off. Deliver the outcome on screen within thirty seconds." },
      { offset: 240, duration: 45, text: "Feedback loops determine who survives. Give your users the ability to edit the AI output inline, copy it in one click, and export as clean markdown. That builds trust." },
      { offset: 285, duration: 40, text: "When you respect the creator's time, they become your biggest advocates. Stop building dashboards with twenty charts. Build an editorial workspace that gets the job done." }
    ]
  },
  'creator-economy-trends': {
    id: 'creator-economy-trends',
    url: 'https://www.youtube.com/watch?v=7uVmsL6pE8Q',
    title: 'The Creator Burnout Epidemic: Why One-to-Many Repurposing Is Survival',
    author: 'Creator Economy Review',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
    durationEstimate: '28:10',
    description: 'An honest look at creator fatigue, the algorithm treadmill, and why smart creators treat every episode as an asset library rather than a one-time broadcast.',
    transcript: [
      { offset: 0, duration: 25, text: "More than sixty percent of solo creators report burnout within their second year. Why? Because the algorithm demands constant presence on four different networks simultaneously." },
      { offset: 25, duration: 35, text: "If you spend 20 hours recording, editing, and publishing a flagship video, it has a half-life of roughly forty-eight hours on YouTube before the impressions taper off." },
      { offset: 60, duration: 45, text: "Top media companies don't make more content; they repurpose systematically. Every hour of raw conversation contains at least six standalone ideas, twelve quotes, and three short clip opportunities." },
      { offset: 105, duration: 40, text: "The secret is understanding context collapse. What works as a 10-minute conversational monologue sounds boring in a text tweet. You have to distill the essence and format it natively." },
      { offset: 145, duration: 45, text: "Show notes aren't just for SEO. Good show notes turn passive listeners into active students of your work. They provide timestamped navigation and highlight takeaways." },
      { offset: 190, duration: 40, text: "By automating the repetitive formatting—generating the chapters, summarizing key themes, drafting the LinkedIn synopsis—you reclaim fifteen hours every week for high-leverage creative work." }
    ]
  }
};
