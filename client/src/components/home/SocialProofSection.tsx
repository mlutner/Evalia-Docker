const socialProofItems = [
  { title: "Learning & Development Teams", bgGradient: "from-white to-evalia-teal-50/20" },
  { title: "Corporate Trainers", bgGradient: "from-white to-evalia-mint/10" },
  { title: "HR Professionals", bgGradient: "from-white to-evalia-teal-50/20" },
  { title: "Training Facilitators", bgGradient: "from-white to-evalia-mint/10" },
];

export function SocialProofSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-white via-evalia-teal-50/30 to-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-center text-3xl lg:text-4xl font-bold text-evalia-navy mb-12" data-testid="text-trusted-by">
          Trusted by training professionals worldwide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
          {socialProofItems.map((item) => (
            <div key={item.title} className="group hover-elevate transition-all">
              <div className={`bg-gradient-to-br ${item.bgGradient} border border-gray-200 hover:border-evalia-teal-300 rounded-xl p-8 min-h-32 flex flex-col items-center justify-center text-center transition-all`}>
                <p className="text-gray-800 font-bold text-base leading-relaxed group-hover:text-evalia-navy transition-colors">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
