import { TemplateCard } from "../../components/TemplateCard";
import { templateCatalog } from "../../lib/demo";

export default function TemplatesPage() {
  return (
    <main className="page space-y-6">
      <section className="panel rounded-[32px] p-8">
        <div className="eyebrow">Protocol recipes</div>
        <h1 className="mt-4 text-4xl text-white">Template catalog</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Guardian is fully implemented for the hackathon demo. Treasury and Compound are presented as the next rules
          that can ride the same trigger, condition, and action rail.
        </p>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        {templateCatalog.map((template) => (
          <TemplateCard
            key={template.slug}
            href={template.slug === "guardian" ? "/create" : "/templates"}
            name={template.name}
            summary={template.summary}
            status={template.status}
          />
        ))}
      </div>
    </main>
  );
}
