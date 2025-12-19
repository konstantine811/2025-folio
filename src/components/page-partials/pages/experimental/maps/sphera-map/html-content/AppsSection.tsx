import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

const AppsSection = () => {
  const [activeTab, setActiveTab] = useState("PUBLIC INVESTMENT");

  const tabs = [
    "PUBLIC INVESTMENT",
    "PUBLIC PROCUREMENT",
    "INTERNATIONAL PROJECTS",
  ];

  const contextualHeadings = {
    "PUBLIC INVESTMENT": "if you are in sales",
    "PUBLIC PROCUREMENT": "PROJECTOR",
    "INTERNATIONAL PROJECTS": "if you are in procurement",
  };

  const apps = [
    {
      title: "AGENTS",
      description:
        "Mayo County Council seeks an on-Premise Hyper-Converged Infrastructure which can be integrated with Public/Private Cloud infrastructure manageable via a single management",
      button: null,
    },
    {
      title: "LOOPS",
      description:
        "Mayo County Council seeks an on-Premise Hyper-Converged Infrastructure which can be integrated with Public/Private Cloud infrastructure manageable via a single management",
      button: null,
    },
    {
      title: "PROJECTOR",
      description:
        "Mayo County Council seeks an on-Premise Hyper-Converged Infrastructure which can be integrated with Public/Private Cloud infrastructure manageable via a single management",
      button: { text: "GO TO APP →", variant: "dark" },
    },
    {
      title: "PROCURE2PAY",
      description:
        "Mayo County Council seeks an on-Premise Hyper-Converged Infrastructure which can be integrated with Public/Private Cloud infrastructure manageable via a single management",
      button: { text: "LEARN MORE", variant: "light" },
    },
    {
      title: "REFERENT",
      description:
        "Mayo County Council seeks an on-Premise Hyper-Converged Infrastructure which can be integrated with Public/Private Cloud infrastructure manageable via a single management",
      button: { text: "LEARN MORE", variant: "light" },
    },
    {
      title: "SPEND ANALYSIS",
      description: null,
      items: ["CATEGORY MANAGEMENT", "PROCURE-2-PAY", "SOURCE-2-CONTRACT"],
      button: null,
    },
  ];

  return (
    <section className="w-full bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Heading */}
        <motion.h2
          className="text-5xl md:text-7xl font-bold text-black uppercase text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          APPS OF YOUR SPHERA
        </motion.h2>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 border uppercase text-sm font-medium transition-all ${
                activeTab === tab
                  ? "border-black bg-black text-white"
                  : "border-slate-300 bg-white text-black hover:border-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Contextual Headings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {tabs.map((tab, index) => (
            <motion.p
              key={tab}
              className={`text-sm text-slate-500 ${
                index === 0
                  ? "text-left"
                  : index === 1
                  ? "text-center"
                  : "text-right"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: activeTab === tab ? 1 : 0.5 }}
              transition={{ duration: 0.3 }}
            >
              {contextualHeadings[tab as keyof typeof contextualHeadings]}
            </motion.p>
          ))}
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app, index) => (
            <motion.div
              key={app.title}
              className="bg-white border border-slate-200 p-6 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3 className="text-xl font-bold uppercase text-black mb-4">
                {app.title}
              </h3>

              {app.description && (
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  {app.description}
                </p>
              )}

              {app.items && (
                <ul className="space-y-2 mb-4">
                  {app.items.map((item) => (
                    <li
                      key={item}
                      className="text-sm font-bold text-black uppercase"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {app.button && (
                <button
                  className={`mt-auto px-6 py-2 text-sm font-medium transition-all ${
                    app.button.variant === "dark"
                      ? "bg-slate-800 text-white hover:bg-slate-900"
                      : "border border-slate-300 text-black hover:border-black"
                  }`}
                >
                  {app.button.text}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AppsSection;
