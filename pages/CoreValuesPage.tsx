
import React from 'react';
import FadeInOnScroll from '../components/FadeInOnScroll';

const coreValues = [
    {
        title: "Pursuing Healthy Relationships",
        description: "We thrive through relationships with others as we show up authentically, with kindness and with honor. Living this way creates invitational and nurturing communities that love genuinely, risk vulnerability, and communicate effectively.\n\nWhen conflicts arise, we choose reconciliation over division. We celebrate diversity and create spaces where everyone can belong before they believe. By pursuing healthy relationships, we reflect the heart of God who is relational at His core.",
        practices: [
            "Creating a culture of honor where we call out the gold in each other",
            "Developing listening skills that seek understanding before resolution",
            "Establishing clear boundaries that protect our hearts without building walls",
            "Risking vulnerability that leads to genuine connection",
            "Extending grace that reflects how God has been gracious to us",
        ]
    },
    {
        title: "Accessing Abundant Wholeness",
        description: "We thrive in complete joy and are able to live from abundance because Jesus loves us and paid for everything we need by His work on the cross, opening the way for our complete salvation, complete healing, and complete deliverance.\n\nWe believe God's desire is for His people to experience wholeness in every area of life—spiritually, emotionally, physically, and relationally. This fullness isn't just for a select few but is available to everyone who follows Jesus.",
        practices: [
            "Approaching life from a position of having what we need, not lack",
            "Receiving God's healing for past wounds and present struggles",
            "Embracing both divine intervention and wise stewardship of our bodies and minds",
            "Living with an inheritance mindset rather than an orphan mentality",
            "Extending the wholeness we've received to others around us",
        ]
    },
    {
        title: "Knowing Our Greatness",
        description: "We thrive as we serve with God by ministering in our unique and personal way to the world around us with excellence, believing there is no spectator Christianity and that inherent in every person is great value and destiny.\n\nWe help people discover their spiritual gifts and natural talents, then provide opportunities for them to use these gifts to serve others. Each person has a God-given purpose that, when fulfilled, brings deep satisfaction and impacts the kingdom.",
        practices: [
            "Discovering and developing the unique gifts God has given each of us",
            "Serving from a place of identity rather than to earn approval",
            "Pursuing excellence without succumbing to perfectionism",
            "Creating pathways for everyone to contribute meaningfully",
            "Celebrating the diverse ways God's image is reflected through each person",
        ]
    },
    {
        title: "Owning A Supernatural Lifestyle",
        description: "We thrive in risk, faith, miracles, signs, and wonders as we partner with the Holy Spirit, being freed to live a supernatural life instead of living in the brokenness of sin and religious bondage.\n\nThe same power that raised Jesus from the dead is available to believers today. We create space for God to move supernaturally through prayer for healing, prophetic ministry, and Spirit-led worship. The supernatural should be normal for Christians.",
        practices: [
            "Expecting God to work in and through us in ways that exceed natural explanation",
            "Developing spiritual sensitivity to hear God's voice and respond to His leading",
            "Praying boldly for healing, miracles, and breakthrough",
            "Taking faith-filled risks when God prompts us to step out",
            "Balancing supernatural expectation with biblical wisdom and character",
        ]
    },
    {
        title: "Treasuring His Presence",
        description: "We thrive in a growing relationship with God through daily interaction with Him in worship, prayer, and reading the Word. This relationship brings about a kingdom mindset that allows us to live loved and causes us to be fully alive.\n\nWhen we experience God's presence, transformation happens naturally. We prioritize creating environments where people can encounter God personally, whether in corporate worship or private devotion.",
        practices: [
            "Cultivating daily rhythms that create space to connect with God",
            "Approaching worship as relationship, not religious duty",
            "Prioritizing God's presence over programs and performance",
            "Creating environments where encountering God is accessible to all",
            "Allowing His presence to transform us from the inside out",
        ]
    },
    {
        title: "Living the Gospel",
        description: "We thrive as we model and share the life of Christ through a life of servanthood and overwhelming generosity, with a desire that our friends, families, and communities know the amazing love and salvation of Jesus.\n\nThe good news isn't just for Sundays—it's for everyday life. We demonstrate God's love through practical acts of service, generous giving, and sharing our faith with others in natural, relational ways.",
        practices: [
            "Serving others with no strings attached",
            "Giving generously of our time, talent, and treasure",
            "Sharing our faith through both words and actions",
            "Advocating for justice and standing with the marginalized",
            "Being good news to our neighborhoods, workplaces, and city",
        ]
    }
];

const CoreValueCard: React.FC<{ value: typeof coreValues[0] }> = ({ value }) => (
    <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col h-full">
        <h3 className="font-header font-extrabold text-3xl tracking-tight text-brand-primary">{value.title}</h3>
        <div className="mt-4 text-gray-700 leading-relaxed space-y-4">
            {value.description.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-header font-extrabold text-lg text-brand-text">In practice, this means:</h4>
            <ul className="mt-4 space-y-3">
                {value.practices.map((practice, index) => (
                    <li key={index} className="flex items-start">
                        <svg className="flex-shrink-0 h-5 w-5 text-green-500 mt-1 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">{practice}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);


const CoreValuesPage: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <section className="bg-brand-secondary py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-header font-extrabold text-5xl md:text-6xl tracking-tight">Our Core Values</h1>
          <p className="font-accent italic text-2xl mt-2 text-gray-600">When what's important to God becomes precious to us, transformation happens naturally.</p>
        </div>
      </section>

      <section className="py-20 bg-brand-bg">
        <FadeInOnScroll className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="font-header font-extrabold text-4xl tracking-tight">Living from the Inside Out</h2>
                <div className="mt-6 text-lg text-gray-700 leading-relaxed space-y-4">
                    <p>
                        Values shape who we are at our core—they guide our decisions, relationships, and daily choices. At Upper Room Fellowship, we believe transformation happens when our hearts align with God's heart. 
                    </p>
                     <p>
                        As we embrace what matters to God, we begin experiencing the freedom and fullness He designed for us. We don't focus on achieving perfection but welcome God's work changing us from within. When God's priorities become our own, we naturally reflect more of Jesus in our everyday lives.
                    </p>
                    <p className="font-bold">
                        The beautiful result? We become carriers of His love and light wherever we go—in our homes, workplaces, and throughout our community.
                    </p>
                    <p>
                        The following core values drive everything we do at Upper Room Fellowship.
                    </p>
                </div>
            </div>
        </FadeInOnScroll>
      </section>

      <section className="py-20 bg-brand-light-gray">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12">
                  {coreValues.map((value, index) => (
                    <FadeInOnScroll key={value.title} style={{ transitionDelay: `${(index % 2) * 150}ms` }}>
                        <CoreValueCard value={value} />
                    </FadeInOnScroll>
                  ))}
              </div>
          </div>
      </section>

      <section className="py-20 bg-brand-bg">
        <FadeInOnScroll className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
                 <h2 className="font-header font-extrabold text-4xl tracking-tight">Growing in Our Values</h2>
                 <div className="mt-6 text-lg text-gray-700 leading-relaxed space-y-4">
                    <p>
                        These values aren't just words for us. They're the heart of what we believe and how we try to live. Jesus showed us what these values look like in action, and we're doing our best to follow His example. These values shape everything we do as a church.
                    </p>
                     <p>
                        Living by these values isn't always easy, but we've found it's incredibly rewarding. There's a real sense of purpose and joy that comes from aligning our lives with what God values.
                    </p>
                     <p>
                        We'd love for you to join us on this journey. Whether you're just starting to explore faith or you've been at it for years, there's always something new to discover. As the Psalms put it, "There truly is a reward for those who live for God" (Psalm 58:11b NLT). We've found this to be true in our own lives, and we'd love to share that experience with you.
                    </p>
                 </div>
            </div>
        </FadeInOnScroll>
      </section>

    </div>
  );
};

export default CoreValuesPage;