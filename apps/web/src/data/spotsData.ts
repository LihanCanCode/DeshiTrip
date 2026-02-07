export interface TourPlan {
    transport: {
        method: { en: string; bn: string };
        details: { en: string; bn: string };
        cost: string;
    }[];
    sightseeing: { en: string; bn: string }[];
    hotels: { en: string; bn: string }[];
    totalEstimatedCost: { en: string; bn: string };
}

export interface Spot {
    _id: string;
    name: { en: string; bn: string };
    location: { coordinates: [number, number] };
    description?: { en: string; bn: string };
    tourPlan?: TourPlan;
    isSearchResult?: boolean;
}

export const spotsData: Spot[] = [
    {
        _id: '1',
        name: { en: 'Ratargul (Sylhet)', bn: 'রাতারগুল (সিলেট)' },
        location: { coordinates: [91.9333, 24.9833] },
        description: {
            en: "The only swamp forest in Bangladesh, located in Gowainghat, Sylhet. Known as the Amazon of Bangladesh.",
            bn: "বাংলাদেশের একমাত্র সোয়াম্প ফরেস্ট বা জলাবন, যা সিলেটের গোয়াইনঘাটে অবস্থিত। এটি বাংলার আমাজন নামেও পরিচিত।"
        },
        tourPlan: {
            transport: [
                {
                    method: { en: "Bus", bn: "বাস" },
                    details: { en: "Ena/Hanif from Dhaka to Sylhet (Humayun Rashid Chattar)", bn: "ঢাকা থেকে সিলেট (হুমায়ূন রশিদ চত্বর) এনা/হানিফ পরিবহন" },
                    cost: "800 - 1500 BDT"
                },
                {
                    method: { en: "Train", bn: "ট্রেন" },
                    details: { en: "Parabat/Upaban Express to Sylhet Station", bn: "পারাবত/উপবন এক্সপ্রেসে সিলেট স্টেশন পর্যন্ত" },
                    cost: "345 - 1200 BDT"
                }
            ],
            sightseeing: [
                { en: "Ratargul Watch Tower", bn: "রাতারগুল ওয়াচ টাওয়ার" },
                { en: "Boat Ride in Swamp", bn: "জলাবনে নৌকা ভ্রমণ" }
            ],
            hotels: [
                { en: "Hotel Valley Garden", bn: "হোটেল ভ্যালি গার্ডেন" },
                { en: "Hotel Noorjahan Grand", bn: "হোটেল নূরজাহান গ্র্যান্ড" }
            ],
            totalEstimatedCost: { en: "5,000 - 8,000 BDT per person (2 days)", bn: "৫,০০০ - ৮,০০০ টাকা জনপ্রতি (২ দিন)" }
        }
    },
    {
        _id: '2',
        name: { en: 'Cox\'s Bazar', bn: 'কক্সবাজার' },
        location: { coordinates: [91.9760, 21.4272] },
        description: {
            en: "The longest natural sea beach in the world. A popular tourist destination in Bangladesh.",
            bn: "বিশ্বের দীর্ঘতম প্রাকৃতিক সমুদ্র সৈকত। বাংলাদেশের একটি অত্যন্ত জনপ্রিয় পর্যটন কেন্দ্র।"
        },
        tourPlan: {
            transport: [
                {
                    method: { en: "Bus", bn: "বাস" },
                    details: { en: "Green Line/Shohagh/Hanif from Dhaka to Kolatoli", bn: "ঢাকা থেকে কলাতলী গ্রীন লাইন/সোহাগ/হানিফ পরিবহন" },
                    cost: "1000 - 2500 BDT"
                },
                {
                    method: { en: "Train", bn: "ট্রেন" },
                    details: { en: "Cox's Bazar Express from Dhaka", bn: "ঢাকা থেকে কক্সবাজার এক্সপ্রেস" },
                    cost: "800 - 1800 BDT"
                }
            ],
            sightseeing: [
                { en: "Laboni Beach", bn: "লাবনী সৈকত" },
                { en: "Inani Beach", bn: "ইনানী সৈকত" },
                { en: "Marine Drive", bn: "মেরিন ড্রাইভ" }
            ],
            hotels: [
                { en: "Sayeman Beach Resort", bn: "সায়দমান বিচ রিসোর্ট" },
                { en: "Royal Tulip", bn: "রয়্যাল টিউলিপ" }
            ],
            totalEstimatedCost: { en: "7,000 - 15,000 BDT per person (3 days)", bn: "৭,০০০ - ১৫,০০০ টাকা জনপ্রতি (৩ দিন)" }
        }
    },
    {
        _id: '3',
        name: { en: 'Sundarbans (Gateway: Mongla)', bn: 'সুন্দরবন (তরণ: মোংলা)' },
        location: { coordinates: [89.6053, 22.4851] },
        description: {
            en: "The largest mangrove forest in the world, home to the Royal Bengal Tiger.",
            bn: "বিশ্বের বৃহত্তম ম্যানগ্রোভ বন, যা রয়্যাল বেঙ্গল টাইগারের আবাসস্থল।"
        },
        tourPlan: {
            transport: [
                {
                    method: { en: "Bus", bn: "বাস" },
                    details: { en: "Dhaka to Khulna/Mongla", bn: "ঢাকা থেকে খুলনা/মোংলা" },
                    cost: "700 - 1500 BDT"
                },
                {
                    method: { en: "Ship/Boat", bn: "জাহাজ/নৌকা" },
                    details: { en: "Tour Operator Package from Mongla Port", bn: "মোংলা বন্দর থেকে ট্যুর অপারেটর প্যাকেজ" },
                    cost: "10,000 - 20,000 BDT"
                }
            ],
            sightseeing: [
                { en: "Karamjal Wildlife Centre", bn: "করমজল বন্যপ্রাণী কেন্দ্র" },
                { en: "Hiron Point", bn: "হীরন পয়েন্ট" }
            ],
            hotels: [
                { en: "Tour Boat Cabins", bn: "ট্যুর বোট কেবিন" }
            ],
            totalEstimatedCost: { en: "12,000 - 20,000 BDT per person (3 days)", bn: "১২,০০০ - ২০,০০০ টাকা জনপ্রতি (৩ দিন)" }
        }
    },
    {
        _id: '4',
        name: { en: 'Sajek Valley', bn: 'সাজেক ভ্যালি' },
        location: { coordinates: [92.2938, 23.3820] },
        description: {
            en: "Known as the Queen of Hills & Roof of Rangamati. Famous for cloud gazing.",
            bn: "পাহাড়ের রানী এবং রাঙামাটির ছাদ হিসেবে পরিচিত। মেঘ দেখার জন্য বিখ্যাত।"
        },
        tourPlan: {
            transport: [
                {
                    method: { en: "Bus", bn: "বাস" },
                    details: { en: "Dhaka to Khagrachari (Shanti Paribahan)", bn: "ঢাকা থেকে খাগড়াছড়ি (শান্তি পরিবহন)" },
                    cost: "850 - 1600 BDT"
                },
                {
                    method: { en: "Jeep (Chander Gari)", bn: "জিপ (চান্দের গাড়ি)" },
                    details: { en: "Khagrachari to Sajek (Reserve)", bn: "খাগড়াছড়ি থেকে সাজেক (রিজার্ভ)" },
                    cost: "8,000 - 10,000 BDT (Shareable)"
                }
            ],
            sightseeing: [
                { en: "Konglak Para", bn: "কংলাক পাড়া" },
                { en: "Helipad Sunrise", bn: "হেলিপ্যাড সূর্যোদয়" }
            ],
            hotels: [
                { en: "Sajek Resort", bn: "সাজেক রিসোর্ট" },
                { en: "Meghpunji Resort", bn: "মেঘপুঞ্জি রিসোর্ট" }
            ],
            totalEstimatedCost: { en: "6,000 - 10,000 BDT per person (2 days)", bn: "৬,০০০ - ১০,০০০ টাকা জনপ্রতি (২ দিন)" }
        }
    },
    {
        _id: '5',
        name: { en: 'Saint Martin\'s (Gateway: Teknaf)', bn: 'সেন্ট মার্টিন (তরণ: টেকনাফ)' },
        location: { coordinates: [92.2957, 20.8633] }, // Teknaf Port
        description: {
            en: "The only coral island of Bangladesh situated in the Bay of Bengal.",
            bn: "বাংলাদেশের একমাত্র প্রবাল দ্বীপ যা বঙ্গোপসাগরে অবস্থিত।"
        },
        tourPlan: {
            transport: [
                {
                    method: { en: "Bus", bn: "বাস" },
                    details: { en: "Dhaka to Teknaf Port", bn: "ঢাকা থেকে টেকনাফ বন্দর" },
                    cost: "1200 - 2500 BDT"
                },
                {
                    method: { en: "Ship", bn: "জাহাজ" },
                    details: { en: "Teknaf to Saint Martin (Carey Sindbad/Keari)", bn: "টেকনাফ থেকে সেন্ট মার্টিন (কেয়ারি সিন্দবাদ)" },
                    cost: "600 - 1500 BDT (Return)"
                }
            ],
            sightseeing: [
                { en: "Chhera Dwip", bn: "ছেঁড়া দ্বীপ" },
                { en: "Bazar Areas", bn: "বাজার এলাকা" }
            ],
            hotels: [
                { en: "Blue Marine Resort", bn: "ব্লু মেরিন রিসোর্ট" },
                { en: "Labiba Bilas", bn: "লাবিবা বিলাস" }
            ],
            totalEstimatedCost: { en: "6,000 - 10,000 BDT per person (2 days)", bn: "৬,০০০ - ১০,০০০ টাকা জনপ্রতি (২ দিন)" }
        }
    },
    {
        _id: '6',
        name: { en: 'Srimangal (Tea Capital)', bn: 'শ্রীমঙ্গল (চায়ের রাজধানী)' },
        location: { coordinates: [91.7333, 24.3083] },
        description: {
            en: "The tea capital of Bangladesh, famous for its lush tea gardens and rainwater forest.",
            bn: "বাংলাদেশের চায়ের রাজধানী, যা এর সবুজ চা বাগান এবং রেইন ফরেস্টের জন্য বিখ্যাত।"
        },
        tourPlan: {
            transport: [
                {
                    method: { en: "Train", bn: "ট্রেন" },
                    details: { en: "Parabat/Upaban Express from Dhaka", bn: "ঢাকা থেকে পারাবত/উপবন এক্সপ্রেস" },
                    cost: "350 - 1200 BDT"
                },
                {
                    method: { en: "Bus", bn: "বাস" },
                    details: { en: "Ena/Hanif from Dhaka to Srimangal", bn: "ঢাকা থেকে শ্রীমঙ্গল এনা/হানিফ পরিবহন" },
                    cost: "600 - 1000 BDT"
                }
            ],
            sightseeing: [
                { en: "Lawachara National Park", bn: "লাউয়াছড়া জাতীয় উদ্যান" },
                { en: "Finlay Tea Estates", bn: "ফিনলে চা বাগান" }
            ],
            hotels: [
                { en: "Grand Sultan Tea Resort", bn: "গ্র্যান্ড সুলতান টি রিসোর্ট" },
                { en: "Srimangal Tea Resort", bn: "শ্রীমঙ্গল টি রিসোর্ট" }
            ],
            totalEstimatedCost: { en: "5,000 - 9,000 BDT per person (2 days)", bn: "৫,০০০ - ৯,০০০ টাকা জনপ্রতি (২ দিন)" }
        }
    },
    {
        _id: '7',
        name: { en: 'Bandarban (Hills)', bn: 'বান্দরবান (পাহাড়)' },
        location: { coordinates: [92.1917, 22.2333] },
        description: {
            en: "Known as the Darjeeling of Bangladesh, famous for high peaks and tribal culture.",
            bn: "বাংলাদেশের দার্জিলিং হিসেবে পরিচিত, যা উঁচু পাহাড় এবং আদিবাসী সংস্কৃতির জন্য বিখ্যাত।"
        },
        tourPlan: {
            transport: [
                {
                    method: { en: "Bus", bn: "বাস" },
                    details: { en: "Dhaka to Bandarban (S.Alam/Hanif)", bn: "ঢাকা থেকে বান্দরবান (এস.আলম/হানিফ)" },
                    cost: "800 - 1500 BDT"
                },
                {
                    method: { en: "Jeep", bn: "জিপ" },
                    details: { en: "Local Chander Gari for mountain trips", bn: "পাহাড় ভ্রমণের জন্য স্থানীয় চান্দের গাড়ি" },
                    cost: "5,000 - 8,000 BDT (Daily)"
                }
            ],
            sightseeing: [
                { en: "Nilgiri Peak", bn: "নীলগিরি চূড়া" },
                { en: "Golden Buddha Temple", bn: "স্বর্ণ মন্দির" },
                { en: "Nilachal", bn: "নীলাচল" }
            ],
            hotels: [
                { en: "Sairu Hill Resort", bn: "সাইরু হিল রিসোর্ট" },
                { en: "Hotel Plaza", bn: "হোটেল প্লাজা" }
            ],
            totalEstimatedCost: { en: "7,000 - 12,000 BDT per person (3 days)", bn: "৭,০০০ - ১২,০০০ টাকা জনপ্রতি (৩ দিন)" }
        }
    },
    {
        _id: '8',
        name: { en: 'Tanguar Haor (Gateway: Tahirpur)', bn: 'টাঙ্গুয়ার হাওর (তরণ: তাহিরপুর)' },
        location: { coordinates: [91.1782, 25.0921] }, // Tahirpur Road End
        description: {
            en: "A unique freshwater wetland ecosystem and a UNESCO Ramsar site in Sunamganj.",
            bn: "সুনামগঞ্জের একটি অনন্য মিঠা পানির জলাভূমি বাস্তুতন্ত্র এবং ইউনেস্কো রামসার সাইট।"
        },
        tourPlan: {
            transport: [
                {
                    method: { en: "Bus", bn: "বাস" },
                    details: { en: "Dhaka to Sunamganj", bn: "ঢাকা থেকে সুনামগঞ্জ" },
                    cost: "800 - 1200 BDT"
                },
                {
                    method: { en: "Houseboat", bn: "হাউসবোট" },
                    details: { en: "Full package from Sunamganj Ghat", bn: "সুনামগঞ্জ ঘাট থেকে ফুল প্যাকেজ" },
                    cost: "8,000 - 12,000 BDT"
                }
            ],
            sightseeing: [
                { en: "Niladri Lake", bn: "নীলাদ্রি লেক" },
                { en: "Watch Tower", bn: "ওয়াচ টাওয়ার" }
            ],
            hotels: [
                { en: "Premium Houseboats", bn: "প্রিমিয়াম হাউসবোট" }
            ],
            totalEstimatedCost: { en: "8,000 - 12,000 BDT per person (2 days)", bn: "৮,০০০ - ১২,০০০ টাকা জনপ্রতি (২ দিন)" }
        }
    },
    {
        _id: '9',
        name: { en: 'Kuakata (Sagar Kannya)', bn: 'কুয়াকাটা (সাগর কন্যা)' },
        location: { coordinates: [90.1808, 21.8210] },
        description: {
            en: "Famous for panoramic sea views and being able to see both sunrise and sunset.",
            bn: "প্যানোরামিক সমুদ্রের দৃশ্য এবং সূর্যোদয় ও সূর্যাস্ত উভয়ই দেখার জন্য বিখ্যাত।"
        },
        tourPlan: {
            transport: [
                {
                    method: { en: "Bus", bn: "বাস" },
                    details: { en: "Dhaka to Kuakata (via Padma Bridge)", bn: "ঢাকা থেকে কুয়াকাটা (পদ্মা সেতু হয়ে)" },
                    cost: "1000 - 1800 BDT"
                },
                {
                    method: { en: "Launch", bn: "লঞ্চ" },
                    details: { en: "Dhaka to Patuakhali Cabin", bn: "ঢাকা থেকে পটুয়াখালী কেবিন" },
                    cost: "1500 - 4000 BDT"
                }
            ],
            sightseeing: [
                { en: "Red Crab Beach", bn: "লাল কাঁকড়ার চর" },
                { en: "Rakhine Village", bn: "রাখাইন পল্লী" }
            ],
            hotels: [
                { en: "Sikder Resort", bn: "সিকদার রিসোর্ট" },
                { en: "Kuakata Grand", bn: "কুয়াকাটা গ্র্যান্ড" }
            ],
            totalEstimatedCost: { en: "5,000 - 10,000 BDT per person (2 days)", bn: "৫,০০০ - ১০,০০০ টাকা জনপ্রতি (২ দিন)" }
        }
    },
    {
        _id: '10',
        name: { en: 'Jaflong (Sylhet)', bn: 'জাফলং (সিলেট)' },
        location: { coordinates: [92.0163, 25.1587] },
        description: {
            en: "A picturesque hill station famous for its tea gardens and stone collection.",
            bn: "চা বাগান এবং পাথর সংগ্রহের জন্য বিখ্যাত একটি মনোরম হিল স্টেশন।"
        },
        tourPlan: {
            transport: [
                {
                    method: { en: "Bus", bn: "বাস" },
                    details: { en: "Sylhet city to Jaflong (Local/Reserve)", bn: "সিলেট শহর থেকে জাফলং (লোকাল/রিজার্ভ)" },
                    cost: "100 - 2000 BDT"
                }
            ],
            sightseeing: [
                { en: "Lalakhal Blue Water", bn: "লালাখাল নীল জল" },
                { en: "Piain River Zero Point", bn: "পিয়াইন নদী জিরো পয়েন্ট" }
            ],
            hotels: [
                { en: "Grand Sylhet Hotel", bn: "গ্র্যান্ড সিলেট হোটেল" }
            ],
            totalEstimatedCost: { en: "4,000 - 7,000 BDT per person (Day trip)", bn: "৪,০০০ - ৭,০০০ টাকা জনপ্রতি (ডে ট্রিপ)" }
        }
    }
];
