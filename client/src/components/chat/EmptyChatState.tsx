import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Zap, Brain, Code, Pencil, Coffee, Compass, BookOpen, Globe } from 'lucide-react';
import { useChatContext } from '@/context/ChatContext';

const USE_OBSIDIAN_HEAD = true;

const ALL_PROMPTS = [
    {
        title: "Brainstorm ideas",
        desc: "for a new project or hobby",
        icon: Brain,
        color: "text-blue-400",
        variants: [
            "Give me 5 creative ideas for a weekend coding project.",
            "Brainstorm some unique names for a new fitness app.",
            "Help me come up with a concept for a short science-fiction story.",
            "I need some hobby ideas that combine technology and art."
        ]
    },
    {
        title: "Draft a message",
        desc: "to a friend or colleague",
        icon: Pencil,
        color: "text-purple-400",
        variants: [
            "Draft a polite email to a colleague asking for a progress update.",
            "Help me write a warm birthday message for a close friend.",
            "Write a concise LinkedIn message to reach out to a recruiter.",
            "Create a funny text message to invite friends to a board game night."
        ]
    },
    {
        title: "Explain a concept",
        desc: "like quantum physics",
        icon: Zap,
        color: "text-amber-400",
        variants: [
            "Explain how quantum entanglement works in simple terms.",
            "What is the difference between a REST API and GraphQL?",
            "How do black holes actually work?",
            "Explain the concept of 'Compound Interest' to a 10-year-old."
        ]
    },
    {
        title: "Write some code",
        desc: "for a React component",
        icon: Code,
        color: "text-emerald-400",
        variants: [
            "Show me how to build a responsive navbar in React using Tailwind.",
            "Write a Python script to scrape news headlines from a website.",
            "Create a CSS animation for a loading spinner.",
            "How do I use React.useMemo effectively with some code examples?"
        ]
    },
    {
        title: "Plan a trip",
        desc: "explore new destinations",
        icon: Compass,
        color: "text-red-400",
        variants: [
            "Plan a 3-day itinerary for a trip to Tokyo.",
            "What are the best hidden gems to visit in Italy?",
            "Give me a packing list for a hiking trip in the Alps.",
            "Suggest some budget-friendly travel destinations in Europe."
        ]
    },
    {
        title: "Get a recipe",
        desc: "cook something delicious",
        icon: Coffee,
        color: "text-orange-400",
        variants: [
            "Give me a quick and healthy 15-minute dinner recipe.",
            "How do I make a perfect classic Italian Carbonara?",
            "What's a good vegan alternative to scrambled eggs?",
            "Suggest a creative dessert I can make with just 3 ingredients."
        ]
    },
    {
        title: "Recommend a book",
        desc: "find your next read",
        icon: BookOpen,
        color: "text-indigo-400",
        variants: [
            "Recommend some thought-provoking non-fiction books about AI.",
            "What are the must-read classic fantasy novels?",
            "Suggest a gripping mystery novel set in a rainy city.",
            "Give me a list of books that will improve my productivity."
        ]
    },
    {
        title: "Analyze data",
        desc: "understand complex info",
        icon: Globe,
        color: "text-cyan-400",
        variants: [
            "Explain the main trends in global renewable energy for 2024.",
            "How do I interpret a standard box plot in statistics?",
            "What are the key differences between various types of machine learning algorithms?",
            "Can you help me summarize the main points of a financial report?"
        ]
    }
];

export function EmptyChatState() {
    const { setInputValue } = useChatContext();

    const selectedPrompts = useMemo(() => {
        const shuffled = [...ALL_PROMPTS].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 4);
    }, []);

    const handleSuggestionClick = (promptObj: typeof ALL_PROMPTS[0]) => {
        const randomVariant = promptObj.variants[Math.floor(Math.random() * promptObj.variants.length)];
        setInputValue(randomVariant);
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto scrollbar-hide">
            <div className="flex flex-col items-center max-w-3xl w-full py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
                {USE_OBSIDIAN_HEAD ? (
                    <>
                        <div className="relative group -mb-4">
                            <div className="absolute -inset-4 bg-primary/20 rounded-[2rem] blur-2xl group-hover:bg-primary/30 transition-all duration-700 opacity-50" />
                            <div className="h-48 w-48">
                                <img src="obsidian-light-t.png" className="object-cover" />
                            </div>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight bg-gradient-to-b from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
                            Obsidian.
                        </h2>

                        <p className="text-muted-foreground text-lg md:text-xl mb-16 max-w-lg leading-relaxed opacity-80">
                            An optimized client for ChatGPT
                        </p>
                    </>
                ) : (
                    <>
                        <div className="relative group mb-10">
                            <div className="absolute -inset-4 bg-primary/20 rounded-[2rem] blur-2xl group-hover:bg-primary/30 transition-all duration-700 opacity-50" />
                            <Avatar className="h-24 w-24 mt-0.5 shrink-0 text-primary">
                                <AvatarImage src="chatgpt.png" className="object-cover" />
                                <AvatarFallback className="text-xs font-medium bg-chat-ai-avatar text-chat-ai-name font-bold">
                                    GPT
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight bg-gradient-to-b from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
                            I'm ChatGPT
                        </h2>

                        <p className="text-muted-foreground text-lg md:text-xl mb-16 max-w-lg leading-relaxed opacity-80">
                            Your creative partner for brainstorming, writing, and problem solving.
                        </p>
                    </>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                    {selectedPrompts.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => handleSuggestionClick(s)}
                            className="flex items-start gap-4 p-5 rounded-2xl glass-panel border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 group text-left relative overflow-hidden active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className={`w-12 h-12 shrink-0 rounded-xl bg-muted-foreground/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                                <s.icon className={`w-6 h-6 ${s.color} transition-colors`} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                    {s.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-snug">
                                    {s.desc}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
