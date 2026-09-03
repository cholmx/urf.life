
import React from 'react';
import BeliefAccordion from '../components/BeliefAccordion';
import SubNav from '../components/SubNav';
import FadeInOnScroll from '../components/FadeInOnScroll';

const MinistrySection: React.FC<{
    title: string;
    subtitle: string;
    imageUrl: string;
    imageAlt: string;
    imageLeft?: boolean;
    children: React.ReactNode;
}> = ({ title, subtitle, imageUrl, imageAlt, imageLeft = false, children }) => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid md:grid-cols-2 gap-12 items-center ${imageLeft ? 'md:grid-flow-col-dense' : ''}`}>
            <div className={`${imageLeft ? 'md:col-start-2' : ''}`}>
                <p className="font-header uppercase tracking-widest text-sm text-brand-primary font-extrabold">{subtitle}</p>
                <h2 className="font-header font-extrabold text-4xl tracking-tight mt-2">{title}</h2>
                <div className="mt-4 text-gray-700 leading-relaxed space-y-4">
                    {children}
                </div>
            </div>
            <div className={`mt-10 md:mt-0 ${imageLeft ? 'md:col-start-1' : ''}`}>
                <img src={imageUrl} alt={imageAlt} className="rounded-lg shadow-xl w-full h-auto object-cover" />
            </div>
        </div>
    </div>
);

const sozoFaqs = [
    { title: "Is Sozo counseling?", content: "Sozo is not counseling. It is a Spirit-led inner healing and deliverance ministry. While it can address deep emotional wounds, it is not a substitute for professional therapy or medical advice. Our team members are trained in Sozo ministry, not as licensed counselors." },
    { title: "How long does a Sozo session last?", content: "A typical Sozo session lasts between 1.5 to 2 hours. We want to allow ample time for the Holy Spirit to move without feeling rushed." },
    { title: "How many Sozo sessions will I need?", content: "Many people experience significant breakthrough in a single session. However, depending on an individual's journey, some may find benefit in follow-up sessions over time. The Sozo team can help you discern what's best." },
    { title: "What happens during a Sozo session?", content: "A session is a gentle, confidential time of prayer led by two or three trained team members. They will guide you in interacting with the Father, Son, and Holy Spirit to identify and heal root causes of emotional and spiritual wounds." },
    { title: "Will I have to share deeply personal information?", content: "You only need to share what you feel comfortable with. The session is guided by the Holy Spirit, and our team is trained to create a safe and non-judgmental space. Your privacy and comfort are our top priorities." },
    { title: "Is what I share confidential?", content: "Absolutely. All information shared during a Sozo session is held in the strictest confidence. Our team members are bound by a confidentiality agreement." },
    { title: "Do I need to be a member of this church to receive Sozo ministry?", content: "No, Sozo ministry is open to everyone, regardless of church membership. We are happy to serve anyone in our community seeking healing and freedom." },
    { title: "What should I do to prepare for my Sozo session?", content: "The best preparation is to come with an open and expectant heart. Spend some time in prayer, asking the Lord to prepare you for what He wants to do. It's also helpful to get a good night's rest and eat beforehand." },
    { title: "What if I don't experience anything during my session?", content: "Everyone's experience is unique. Some people have dramatic encounters, while others experience a quiet sense of peace or subtle shifts. Trust that God is working, even if it's not in the way you expect. The fruit of a session often becomes more apparent in the days and weeks that follow." },
    { title: "Is Sozo deliverance ministry?", content: "Yes, Sozo is a form of deliverance ministry. Its primary focus is on identifying the root causes that give the enemy access, such as wounds and lies. By healing these roots and replacing lies with God's truth, deliverance often happens gently and naturally." },
    { title: "What makes Sozo different from other prayer ministries?", content: "Sozo focuses on helping individuals connect directly with the Godhead (Father, Son, and Holy Spirit) for themselves. The team's role is to facilitate this connection, not to pray *for* the person, but to guide them in hearing from God personally. It is highly relational and empowering." }
];

const MinistriesPage: React.FC = () => {
    const pageSections = [
        { label: "Kids", id: "kids" },
        { label: "Youth", id: "youth" },
        { label: "Groups", id: "groups" },
        { label: "Worship", id: "worship" },
        { label: "Outreach", id: "outreach" },
        { label: "Sozo", id: "sozo" },
    ];

  return (
    <div className="animate-fade-in">
      <section className="bg-brand-secondary py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-header font-extrabold text-5xl md:text-6xl tracking-tight">Ministries</h1>
          <p className="font-accent italic text-2xl mt-2 text-gray-600">Find Your Place to Connect and Serve</p>
        </div>
      </section>

      <SubNav links={pageSections} />

      <section className="py-20 bg-brand-bg">
        <FadeInOnScroll className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
                <p className="text-lg text-gray-700 leading-relaxed">
                    At Upper Room Fellowship, ministry isn't just something we do—it's how we live out our faith together. We believe in knowing our greatness, that each person has a unique way of ministering to the world around us with excellence. There is no spectator Christianity; inherent in every person is great value and destiny.
                </p>
                 <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                    Our ministries are designed to help you connect with God, build meaningful relationships, and discover the joy of serving others. Whatever your age, interests, or season of life, there's a place for you to belong and make a difference at Upper Room Fellowship.
                </p>
            </div>
        </FadeInOnScroll>
      </section>

      <section id="kids" className="py-20 bg-brand-light-gray">
        <FadeInOnScroll>
            <MinistrySection
                title="Upper Room Kids"
                subtitle="Kids Ministry"
                imageUrl="https://images.unsplash.com/photo-1516627145400-c8f23351d3a3?q=80&w=2070&auto=format&fit=crop"
                imageAlt="Children playing with colorful blocks"
            >
                <p>Upper Room Kids is more than just childcare during service—it's a vibrant, exciting environment where children from birth through 5th grade discover God's love through age-appropriate teaching, fun activities, and caring relationships.</p>
                <p>Our secure check-in system and background-checked volunteers ensure your children are safe while they learn and grow. For parents of young children, we also offer a parent viewing room where you can still experience the service while attending to your little ones.</p>
                <p className="font-bold">Sundays: Children join their families for worship, then are dismissed to age-appropriate classes during the message time.</p>
            </MinistrySection>
        </FadeInOnScroll>
      </section>

      <section id="youth" className="py-20 bg-brand-bg">
        <FadeInOnScroll>
            <MinistrySection
                title="Upper Room Youth"
                subtitle="Student Ministry"
                imageUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                imageAlt="Teenagers laughing and talking together"
                imageLeft={true}
            >
                <p>Upper Room Youth creates a safe, engaging space where 6th-12th graders can build authentic friendships, ask tough questions, and develop a faith that lasts beyond high school. We're passionate about helping students own a supernatural lifestyle and pursue healthy relationships.</p>
                <p>We don't water down the gospel or entertain students with games alone; we challenge them to go deeper in their relationship with Jesus and equip them to live out their faith in school, at home, and in their community.</p>
                <p className="font-bold">The Upper Room Youth meet every Wednesday night from 6:30-8:00pm in the Student Center.</p>
            </MinistrySection>
        </FadeInOnScroll>
      </section>
      
      <section id="groups" className="py-20 bg-brand-light-gray">
        <FadeInOnScroll>
            <MinistrySection
                title="Table Groups"
                subtitle="Small Groups"
                imageUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                imageAlt="People talking and connecting in a small group"
            >
                <p>Life is better together. Living out our value of pursuing healthy relationships, our Table Groups meet throughout the week in homes across the community to study, pray, and share life. These spaces allow us to show up authentically, with kindness and honor.</p>
                <p>Table Groups provide an opportunity to build meaningful relationships, apply biblical teachings to your daily life, and support one another through life's ups and downs.</p>
                <p className="font-bold">Groups typically meet biweekly and monthly and include time for connection, study, and prayer.</p>
            </MinistrySection>
        </FadeInOnScroll>
      </section>

       <section id="worship" className="py-20 bg-brand-bg">
        <FadeInOnScroll>
            <MinistrySection
                title="Worship & Production"
                subtitle="Worship Ministry"
                imageUrl="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070&auto=format&fit=crop"
                imageAlt="Hands raised in worship"
                imageLeft={true}
            >
                <p>Our Worship Ministry creates environments where people can treasure God's presence through music, art, and technology. We believe worship brings about a kingdom mindset that allows us to live loved and causes us to be fully alive.</p>
                <p>Our team strives for excellence while remaining authentic and focused on Jesus. The ministry includes vocalists, musicians, and the production team who handle sound, lighting, and visuals.</p>
                <p className="font-bold">Interested in serving? Complete our Growth Track to learn how to get involved.</p>
            </MinistrySection>
        </FadeInOnScroll>
      </section>
      
      <section id="outreach" className="py-20 bg-brand-light-gray">
        <FadeInOnScroll>
            <MinistrySection
                title="Outreach & Missions"
                subtitle="Local & Global Impact"
                imageUrl="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2070&auto=format&fit=crop"
                imageAlt="Hands holding out food, representing service and outreach"
            >
                <p>We live the Gospel by modeling and sharing the life of Christ through servanthood and overwhelming generosity. Jesus called us to be His witnesses in our community and to the ends of the earth. </p>
                <p>At Upper Room Fellowship, we take this commission seriously by engaging in strategic outreach efforts at the local, regional, and global levels. We're committed to demonstrating God's love in practical ways while sharing the hope of the Gospel.</p>
                <p className="font-bold">Speak with one of our pastors to discover where your passions and our opportunities intersect.</p>
            </MinistrySection>
        </FadeInOnScroll>
      </section>

      {/* Sozo Ministry Section */}
      <section id="sozo" className="py-20 bg-brand-secondary">
        <FadeInOnScroll className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-header font-extrabold text-5xl tracking-tight">Sozo Ministry</h2>
            <p className="font-accent italic text-2xl mt-2 text-gray-600">A journey to inner healing and freedom.</p>
        </FadeInOnScroll>

        <FadeInOnScroll className="max-w-4xl mx-auto mt-12 px-4 sm:px-6 lg:px-8 text-lg text-gray-700 leading-relaxed space-y-6">
            <p><span className="font-bold">"Sozo"</span> is a Greek word used over 100 times in the New Testament meaning "to save, deliver, make whole, restore, and heal." It reflects God's desire for our complete wholeness - spiritually, emotionally, and relationally.</p>
            <p>Are there areas in your life where you feel stuck? Do you sense there's more to your relationship with God? Sozo ministry provides a gentle, Spirit-led path to identify and remove barriers that may be hindering your intimate relationship with God and your ability to walk in the fullness of your God-given identity and purpose.</p>
            <blockquote className="border-l-4 border-brand-primary pl-6 italic">"But Jesus turning and seeing her said, 'Daughter, take courage; your faith has made you well (sozo).' And at once the woman was made well (sozo)." — Matthew 9:22</blockquote>
            <p>A Sozo session is not a counseling session, but rather a time of interacting with Father, Son, and Holy Spirit to seek wholeness and pursue your destiny. Our aim is to love people and provide a safe space where the healing of past wounds can break strongholds, replace lies with truth, and close "doors" to the enemy.</p>
        </FadeInOnScroll>

        <FadeInOnScroll className="max-w-4xl mx-auto mt-16 px-4 sm:px-6 lg:px-8">
            <h3 className="text-center font-header font-extrabold text-3xl tracking-tight mb-8">Begin Your Healing Journey</h3>
            <div className="grid md:grid-cols-4 gap-8 text-center">
                <div className="flex flex-col items-center">
                    <div className="bg-brand-primary text-white rounded-full h-16 w-16 flex items-center justify-center font-header font-extrabold text-2xl">1</div>
                    <h4 className="font-header font-extrabold mt-4 text-xl">Prepare</h4>
                    <p className="text-gray-600 mt-1 text-sm">Seek God through prayer and reflect on areas where you desire freedom.</p>
                </div>
                 <div className="flex flex-col items-center">
                    <div className="bg-brand-primary text-white rounded-full h-16 w-16 flex items-center justify-center font-header font-extrabold text-2xl">2</div>
                    <h4 className="font-header font-extrabold mt-4 text-xl">Reach Out</h4>
                    <p className="text-gray-600 mt-1 text-sm">Email us at <a href="mailto:info@urfellowship.com" className="underline">info@urfellowship.com</a> to start the confidential process.</p>
                </div>
                 <div className="flex flex-col items-center">
                    <div className="bg-brand-primary text-white rounded-full h-16 w-16 flex items-center justify-center font-header font-extrabold text-2xl">3</div>
                    <h4 className="font-header font-extrabold mt-4 text-xl">Connect</h4>
                    <p className="text-gray-600 mt-1 text-sm">Our coordinator will contact you to answer questions and schedule your session.</p>
                </div>
                 <div className="flex flex-col items-center">
                    <div className="bg-brand-primary text-white rounded-full h-16 w-16 flex items-center justify-center font-header font-extrabold text-2xl">4</div>
                    <h4 className="font-header font-extrabold mt-4 text-xl">Partner</h4>
                    <p className="text-gray-600 mt-1 text-sm">A suggested donation of $40 helps support and continue this ministry.</p>
                </div>
            </div>
        </FadeInOnScroll>

        <FadeInOnScroll className="max-w-4xl mx-auto mt-16 px-4 sm:px-6 lg:px-8">
            <h3 className="text-center font-header font-extrabold text-3xl tracking-tight mb-8">Frequently Asked Questions</h3>
            <div className="bg-white p-4 sm:p-8 rounded-lg shadow-md">
                {sozoFaqs.map(faq => (
                    <BeliefAccordion key={faq.title} title={faq.title}>
                        <p>{faq.content}</p>
                    </BeliefAccordion>
                ))}
            </div>
        </FadeInOnScroll>

      </section>

    </div>
  );
};

export default MinistriesPage;