export default function Home() {
  return (
    <div className="relative overflow-hidden">

      {/* GLOBAL BACKGROUND */}
      <div className="absolute inset-0 -z-10 + bg-[radial-gradient(ellipse_at_top,#1e293b,transparent_60%)]" />

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-6 pt-32 pb-28 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
          Manage Projects.{" "}
          <span className="text-primary">Track Progress.</span>{" "}
          Collaborate in Real-Time.
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-gray-400">
          FlowTrack helps modern teams plan, track, and deliver work efficiently
          using Kanban boards, timelines, task dependencies, and live updates.
        </p>

        <div className="mt-10 flex justify-center">
          <button className="px-7 py-3 bg-primary rounded-md text-white hover:opacity-90 transition border">
            Get Started
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative max-w-7xl mx-auto px-6 pb-32">
        <h2 className="text-3xl font-semibold text-center text-white">
          Everything you need to run projects smoothly
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {[
            {
              title: "Kanban Boards",
              desc: "Visualize tasks across flexible, customizable workflows."
            },
            {
              title: "Timeline View",
              desc: "Track deadlines, overlaps, and project milestones clearly."
            },
            {
              title: "Task Dependencies",
              desc: "Prevent blocked work and enforce logical task progress."
            },
            {
              title: "Real-Time Collaboration",
              desc: "See task updates, movements, and comments instantly."
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-card/80 backdrop-blur border border-border/60 rounded-xl p-6 hover:border-primary/40 transition"
            >
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="text-gray-400 mt-2 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-32">
        {/* subtle section glow */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,#020617,transparent_70%)]" />

        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center text-white">
            How FlowTrack works
          </h2>

          <div className="grid md:grid-cols-3 gap-10 mt-20">
            {[
              {
                step: "01",
                title: "Create a Project",
                desc: "Set up your project, invite team members, and define workflows."
              },
              {
                step: "02",
                title: "Plan & Assign Tasks",
                desc: "Break work into tasks, assign owners, set priorities and deadlines."
              },
              {
                step: "03",
                title: "Track Progress Live",
                desc: "Move tasks, monitor timelines, and collaborate in real-time."
              },
            ].map((s) => (
              <div
                key={s.step}
                className="relative bg-card/80 backdrop-blur border border-border/60 rounded-xl p-7"
              >
                <span className="absolute -top-5 left-6 text-xs px-3 py-1 rounded-full bg-bg text-gray-400">
                  {s.step}
                </span>
                <h3 className="font-semibold text-white mt-4">{s.title}</h3>
                <p className="text-gray-400 mt-2 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY FLOWTRACK */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-3xl font-semibold text-white">
              Built for clarity, speed, and scale
            </h2>
            <p className="text-gray-400 mt-6">
              FlowTrack reduces project chaos by centralizing tasks, timelines,
              ownership, and progress into one powerful interface.
            </p>
            <ul className="mt-6 space-y-3 text-gray-400 text-sm">
              <li>• Fewer status meetings</li>
              <li>• Clear accountability</li>
              <li>• Faster delivery cycles</li>
              <li>• Real-time visibility</li>
            </ul>
          </div>

          <div className="bg-card/80 backdrop-blur border border-border/60 rounded-xl p-8 text-sm text-gray-400">
            Designed with scalability and collaboration at its core — perfect
            for startups, teams, and growing organizations.
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom,#1e293b,transparent_65%)]" />

        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold text-white">
            Start managing projects the smart way
          </h2>
          <p className="text-gray-400 mt-4">
            Join teams building better products with FlowTrack.
          </p>
          <button className="mt-10 px-8 py-3 bg-primary rounded-md text-white hover:opacity-90 transition cursor-pointer">
            Get Started for Free
          </button>
        </div>
      </section>

    </div>
  );
}
