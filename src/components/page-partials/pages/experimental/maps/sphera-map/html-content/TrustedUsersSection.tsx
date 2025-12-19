import { motion } from "framer-motion";
import Phone3D from "./Phone3D";

const TrustedUsersSection = () => {
  return (
    <section className="w-full bg-[#1e293b] py-24 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content - Text Block */}
        <motion.div
          className="text-slate-300"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-base md:text-lg leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum. Sed ut
            perspiciatis unde omnis iste natus error sit voluptatem accusantium
            doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo
            inventore veritatis et quasi architecto beatae vitae dicta sunt
            explicabo.
          </p>
        </motion.div>

        {/* Right Content - Phone with UI Elements */}
        <motion.div
          className="flex flex-col items-end lg:items-start"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Main Container with Phone */}
          <div className="relative w-full max-w-md">
            {/* 3D Phone Model Container */}
            <div className="absolute w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[900px] rounded-[2rem]">
              <Phone3D />
            </div>

            {/* UI Elements around Phone */}
            {/* Top-Left Badge */}
            <div className="absolute top-8 left-8 w-12 h-12 rounded-full bg-blue-500/80 backdrop-blur-sm border border-blue-400/50 shadow-lg flex items-center justify-center z-10">
              <span className="text-white font-bold text-lg">1</span>
            </div>

            {/* Bottom-Right Badge */}
            <div className="absolute bottom-8 right-8 w-12 h-12 rounded-full bg-blue-500/80 backdrop-blur-sm border border-blue-400/50 shadow-lg flex items-center justify-center z-10">
              <span className="text-white font-bold text-lg">2</span>
            </div>

            {/* Left Text - Total Income */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <p className="text-white text-sm mb-1">Total income</p>
              <p className="text-blue-400 text-2xl font-bold">$ 5,200</p>
            </div>

            {/* Right Text - Apps Connected */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-right">
              <p className="text-white text-sm mb-1">Apps Connected</p>
              <p className="text-blue-400 text-2xl font-bold">12</p>
            </div>

            {/* Trusted Users Badge - Bottom Left */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-3 shadow-lg">
                {/* Profile Pictures */}
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white/20" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-red-500 border-2 border-white/20" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-500 border-2 border-white/20" />
                </div>

                {/* Text */}
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white">19,580k+</span>
                  <span className="text-xs text-slate-300">Trusted Users</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustedUsersSection;
