const Regard = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      {/* Background Image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url('https://res.cloudinary.com/dkvtnjc2f/image/upload/f_auto,q_auto/v1736683940/keshav-cup-2025-logo_3x_ijcn3k.png')",
          backgroundSize: "contain", // Scale the image proportionally
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#F4F4F5", // Fallback background color
          opacity: 0.1, // Reduce the image opacity
        }}
      ></div>

      {/* Content */}
      <div className="relative bg-transparent bg-opacity-20 p-6 rounded-lg text-center max-w-md mx-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-black">
          Thank You!
        </h1>
        <p className="text-base md:text-lg text-black">
          Your ratings have been successfully submitted. Stay tuned for the
          exciting Auction Day !
        </p>
      </div>
    </div>
  );
};

export default Regard
