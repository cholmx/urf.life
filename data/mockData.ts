
import type { Sermon, LeadershipMember, Ministry } from '../types';

export const SERMONS: Sermon[] = [
  {
    id: 'sermon-1',
    title: 'Hope in the Valley',
    speaker: 'John Piper',
    series: 'Psalms: Songs of the Heart',
    date: '2024-07-21',
    imageUrl: 'https://images.unsplash.com/photo-1454418243875-2423b473d063?q=80&w=2070&auto=format&fit=crop',
    youtubeVideoId: '6g3g33_w2_c',
    description: 'Discovering unwavering hope and the presence of God even in life\'s darkest moments, through the lens of Psalm 23.',
    topics: ['hope', 'psalm 23', 'trust', 'suffering'],
    transcript: `(Intro Music fades)

Good morning, church. It's so good to see you today. If you have your Bibles, please open them to Psalm 23. We're starting a new series called "Songs of the Heart," and there's no better place to begin than with this beloved psalm.

Many of us know these words by heart. We've heard them at funerals, seen them on plaques. "The Lord is my shepherd; I shall not want." But have we ever stopped to truly meditate on what David is saying here? This isn't just a comforting poem; it's a radical declaration of trust in the character of God.

Verse one: "The Lord is my shepherd." It doesn't say "a shepherd" or "like a shepherd." It's personal. "My shepherd." This implies relationship, care, and guidance. A shepherd knows his sheep. He provides for them, protects them, leads them. David is saying that Yahweh, the creator of the universe, takes on this intimate role in his life.

"I shall not want." This is a direct consequence of the first statement. Because the Lord is his shepherd, he lacks nothing essential. It doesn't mean he gets every whim and desire, but that his deepest needs are met in God himself. God is the provision.

Verse two and three: "He makes me lie down in green pastures. He leads me beside still waters. He restores my soul." Notice the action of the shepherd. He *makes* me lie down. Sometimes we need to be lovingly forced to rest. He *leads* me. He doesn't push from behind. He goes before us. And the result? Soul restoration. In a world that constantly drains us, our shepherd brings us back to life.

Now, verse four is where the rubber meets the road. "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me."

This psalm is not a promise that we will avoid valleys. It's a promise of God's presence *in* the valley. The valley is a place of shadow, not substance. The threat might feel real, but our shepherd is with us. His rod protects from predators, and his staff guides us along the path. This is not a passive presence; it's an active, protecting, guiding presence.

Finally, verses five and six shift the metaphor. "You prepare a table before me in the presence of my enemies... you anoint my head with oil; my cup overflows." This is a picture of extravagant hospitality and vindication. In the very face of those who oppose us, God honors us. He doesn't just give us a little; our cup overflows.

"Surely goodness and mercy shall follow me all the days of my life, and I will dwell in the house of the Lord forever." This is the confident conclusion. Not "maybe" or "I hope so," but "surely." Because of who our shepherd is, our future is secure.

So, church, my question for us today is this: Is the Lord *your* shepherd? Not just a concept, but a daily, living reality. When we can truly say "The Lord is my shepherd," we can also say "I shall not want," even when we're walking through the darkest valley. Let's pray.`
  },
  {
    id: 'sermon-2',
    title: 'The Prodigal God',
    speaker: 'Tim Keller',
    series: 'Parables of Jesus',
    date: '2024-07-14',
    imageUrl: 'https://images.unsplash.com/photo-1594755397851-32d182fe8852?q=80&w=2070&auto=format&fit=crop',
    description: 'A deep dive into the parable of the Prodigal Son, revealing the radical nature of God\'s grace for both the rebellious and the religious.',
    topics: ['grace', 'forgiveness', 'parables', 'luke 15']
  },
    {
    id: 'sermon-3',
    title: 'Love Your Neighbor',
    speaker: 'Jane Smith',
    series: 'Living Out the Gospel',
    date: '2024-07-07',
    imageUrl: 'https://images.unsplash.com/photo-1521404926927-417c83c57564?q=80&w=1974&auto=format&fit=crop',
    description: 'What does it practically mean to love our neighbors as ourselves in our modern, complex world?',
    topics: ['love', 'community', 'service']
  },
  {
    id: 'sermon-4',
    title: 'A Faith That Works',
    speaker: 'John Piper',
    series: 'The Book of James',
    date: '2024-06-30',
    imageUrl: 'https://images.unsplash.com/photo-1600880292210-859b92599729?q=80&w=2070&auto=format&fit=crop',
    description: 'Exploring the connection between genuine faith and tangible action, as taught in the book of James.',
    topics: ['faith', 'works', 'james', 'obedience']
  },
   {
    id: 'sermon-5',
    title: 'The Father\'s Heart',
    speaker: 'Tim Keller',
    series: 'Parables of Jesus',
    date: '2024-06-23',
    imageUrl: 'https://images.unsplash.com/photo-1508962912214-c8c56cf49830?q=80&w=2070&auto=format&fit=crop',
    description: 'Continuing the look at Luke 15, we see the extravagant love of the Father that runs to meet us.',
    topics: ['grace', 'fatherhood of god', 'parables']
  },
  {
    id: 'sermon-6',
    title: 'The Good Shepherd',
    speaker: 'John Piper',
    series: 'Psalms: Songs of the Heart',
    date: '2024-06-16',
    imageUrl: 'https://images.unsplash.com/photo-1506496924290-07a8b6d4b248?q=80&w=2070&auto=format&fit=crop',
    description: 'An introduction to our series in the Psalms, focusing on David\'s declaration that "The Lord is my shepherd."',
    topics: ['psalm 23', 'guidance', 'provision']
  }
];

export const LEADERSHIP: LeadershipMember[] = [
    {
        name: 'Dr. James Richards',
        role: 'Senior Pastor',
        bio: 'Pastor James has been leading Gracehill for over 15 years with a passion for biblical teaching and authentic community.',
        imageUrl: 'https://picsum.photos/400/400?random=1'
    },
    {
        name: 'Sarah Chen',
        role: 'Worship Pastor',
        bio: 'Sarah leads our congregation in worship each week, crafting services that are both musically excellent and spiritually deep.',
        imageUrl: 'https://picsum.photos/400/400?random=2'
    },
    {
        name: 'Michael B. Jordan',
        role: 'Youth Pastor',
        bio: 'Michael has a heart for the next generation and leads our vibrant youth ministry for middle and high school students.',
        imageUrl: 'https://picsum.photos/400/400?random=3'
    }
];

export const MINISTRIES: Ministry[] = [
    {
        name: 'Gracehill Kids',
        description: 'A fun and safe environment for children (birth-5th grade) to learn about Jesus on their level.',
        imageUrl: 'https://picsum.photos/800/600?random=21',
        contact: 'Contact: children@gracehill.church'
    },
    {
        name: 'Student Ministry',
        description: 'A dynamic community for middle and high school students to grow in their faith and build lasting friendships.',
        imageUrl: 'https://picsum.photos/800/600?random=22',
        contact: 'Contact: students@gracehill.church'
    },
    {
        name: 'Community Groups',
        description: 'Small groups that meet in homes throughout the week for Bible study, prayer, and fellowship.',
        imageUrl: 'https://picsum.photos/800/600?random=23',
        contact: 'Contact: groups@gracehill.church'
    }
];
