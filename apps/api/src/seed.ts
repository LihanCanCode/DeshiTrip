import mongoose from 'mongoose';
import { Spot } from './models/Spot';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/deshitrip';

const spots = [
    {
        name: { en: 'Ratargul Swamp Forest', bn: 'রাতারগুল সোয়াম্প ফরেস্ট' },
        description: {
            en: 'The only freshwater swamp forest in Bangladesh and one of the few in the world.',
            bn: 'বাংলাদেশের একমাত্র মিষ্টি পানির জলাবন এবং বিশ্বের হাতেগোনা কয়েকটি জলাবনের মধ্যে একটি।'
        },
        district: 'Sylhet',
        location: { type: 'Point', coordinates: [91.9333, 24.9833] },
        images: ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop'],
        tags: ['nature', 'forest', 'boat-trip'],
        averageCost: 500,
        bestSeason: ['Monsoon', 'Autumn']
    },
    {
        name: { en: "Cox's Bazar", bn: 'কক্সবাজার' },
        description: {
            en: 'The longest natural sea beach in the world, famous for its sandy beaches and sunsets.',
            bn: 'বিশ্বের দীর্ঘতম প্রাকৃতিক সমুদ্র সৈকত, যা এর বালুকাময় সৈকত এবং সূর্যাস্তের জন্য বিখ্যাত।'
        },
        district: "Cox's Bazar",
        location: { type: 'Point', coordinates: [91.9760, 21.4272] },
        images: ['https://images.unsplash.com/photo-1623945359620-8049281559ed?w=800&auto=format&fit=crop'],
        tags: ['beach', 'ocean', 'sunset'],
        averageCost: 1500,
        bestSeason: ['Winter', 'Spring']
    },
    {
        name: { en: 'Sundarbans', bn: 'সুন্দরবন' },
        description: {
            en: 'The largest mangrove forest in the world and home to the Royal Bengal Tiger.',
            bn: 'বিশ্বের বৃহত্তম ম্যানগ্রোভ বন এবং রয়্যাল বেঙ্গল টাইগারের আবাসস্থল।'
        },
        district: 'Khulna',
        location: { type: 'Point', coordinates: [89.3950, 21.9497] },
        images: ['https://images.unsplash.com/photo-1608976328322-91973f638202?w=800&auto=format&fit=crop'],
        tags: ['forest', 'wildlife', 'mangrove'],
        averageCost: 2000,
        bestSeason: ['Winter']
    }
];

const seed = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        await Spot.deleteMany({});
        console.log('Cleared existing spots');

        await Spot.insertMany(spots);
        console.log('Seeded spots successfully');

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seed();
