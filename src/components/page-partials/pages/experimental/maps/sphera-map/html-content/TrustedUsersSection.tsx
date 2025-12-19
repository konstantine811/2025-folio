import { motion } from "framer-motion";

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

        {/* Right Content - Trusted Users Badge */}
        <motion.div
          className="flex flex-col items-end lg:items-start"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative inline-flex items-center gap-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg px-6 py-4 shadow-lg">
            {/* Profile Pictures */}
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-slate-800" />
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-red-500 border-2 border-slate-800" />
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-teal-500 border-2 border-slate-800" />
            </div>

            {/* Text */}
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">19,580k+</span>
              <span className="text-sm text-slate-400">Trusted Users</span>
            </div>
          </div>

          {/* Smartphone Illustration Placeholder */}
          <div className="mt-8 w-64 h-96 bg-slate-700/30 rounded-[2rem] border border-slate-600/50 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-4 bg-slate-800 rounded-[1.5rem] flex items-center justify-center">
              <div className="text-center text-slate-500 text-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-700 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <p>Dashboard UI</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustedUsersSection;
