// Define the type for each feature
interface Feature {
  title: string;
  description: string;
}

const Features = () => {
  // Typed array of features
  const features: Feature[] = [
    {
      title: 'Text Recognition',
      description: 'Accurately extract text from images and handwritten documents',
    },
    {
      title: 'Runs In Your Browser',
      description: 'OCR happens entirely client-side -- no images ever leave your device',
    },
    {
      title: 'Fast Processing',
      description: 'Quick conversion powered by Tesseract.js with high accuracy',
    },
    {
      title: 'Editable Results',
      description: 'Correct recognized text inline, then copy or download it',
    },
  ];

  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-[var(--text-brown)] text-center mb-12">
          Why ScribeLens
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="paper-card p-6 border border-[var(--text-brown)]/10"
            >
              <h3 className="text-lg font-semibold text-[var(--text-brown)] mb-2">
                {feature.title}
              </h3>
              <p className="text-[var(--text-brown)] opacity-80 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
