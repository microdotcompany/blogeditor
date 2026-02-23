import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface FrontmatterField {
  key: string;
  value: unknown;
  type: "text" | "date" | "number" | "image" | "object";
}

interface FrontmatterEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  onClose: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  excerpt: "Excerpt",
  pubDate: "Published",
  updatedDate: "Updated",
  heroImage: "Hero Image",
  heroImageAlt: "Hero Image Alt",
  readingTime: "Reading Time (min)",
  canonicalURL: "Canonical URL",
  author: "Author",
  description: "Description",
  tags: "Tags",
  draft: "Draft",
  category: "Category",
  slug: "Slug",
};

const inferType = (key: string, value: unknown): FrontmatterField["type"] => {
  if (typeof value === "number") return "number";
  if (typeof value === "object" && value !== null && !Array.isArray(value)) return "object";
  if (
    key.toLowerCase().includes("date") ||
    (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value))
  )
    return "date";
  if (key.toLowerCase().includes("image") || key.toLowerCase().includes("img")) return "image";
  return "text";
};

const formatDate = (value: string) => {
  try {
    return new Date(value).toISOString().slice(0, 16);
  } catch {
    return value;
  }
};

const ObjectFields = ({
  parentKey,
  data,
  onChange,
}: {
  parentKey: string;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}) => (
  <div className="space-y-2 rounded-md border bg-muted/30 p-3">
    {Object.entries(data).map(([key, value]) => (
      <div key={key}>
        <label className="mb-1 block text-xs text-muted-foreground">{key}</label>
        {typeof value === "string" && value.startsWith("http") && (key.includes("image") || key.includes("Image")) ? (
          <div className="space-y-2">
            <img src={value} alt="" className="h-10 w-full rounded object-cover" />
            <Input
              value={value}
              className="h-8 text-xs"
              onChange={(e) => onChange({ ...data, [key]: e.target.value })}
            />
          </div>
        ) : (
          <Input
            value={String(value ?? "")}
            className="h-8 text-xs"
            onChange={(e) => onChange({ ...data, [key]: e.target.value })}
          />
        )}
      </div>
    ))}
  </div>
);

export const FrontmatterEditor = ({ data, onChange, onClose }: FrontmatterEditorProps) => {
  const fields: FrontmatterField[] = Object.entries(data).map(([key, value]) => ({
    key,
    value,
    type: inferType(key, value),
  }));

  const updateField = (key: string, value: unknown) => {
    onChange({ ...data, [key]: value });
  };

  if (fields.length === 0) return null;

  return (
    <aside className="fixed inset-y-0 right-0 z-40 flex w-80 flex-col border-l bg-background shadow-xl">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="text-sm font-semibold">Article Settings</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-5 px-5 py-5">
          {fields.map(({ key, value, type }) => (
            <div key={key}>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {FIELD_LABELS[key] || key}
              </label>

              {type === "object" && typeof value === "object" && value !== null ? (
                <ObjectFields
                  parentKey={key}
                  data={value as Record<string, unknown>}
                  onChange={(v) => updateField(key, v)}
                />
              ) : type === "image" ? (
                <div className="space-y-2">
                  {typeof value === "string" && value && (
                    <img src={value} alt="" className="h-20 w-full rounded-md object-cover" />
                  )}
                  <Input
                    value={String(value ?? "")}
                    className="h-8 text-sm"
                    placeholder={`Enter ${FIELD_LABELS[key] || key}...`}
                    onChange={(e) => updateField(key, e.target.value)}
                  />
                </div>
              ) : type === "date" ? (
                <Input
                  type="datetime-local"
                  value={typeof value === "string" ? formatDate(value) : ""}
                  className="h-8 text-sm"
                  onChange={(e) => updateField(key, new Date(e.target.value).toISOString())}
                />
              ) : type === "number" ? (
                <Input
                  type="number"
                  value={String(value ?? "")}
                  className="h-8 text-sm"
                  onChange={(e) => updateField(key, Number(e.target.value))}
                />
              ) : key === "excerpt" || key === "description" ? (
                <textarea
                  value={String(value ?? "")}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder={`Enter ${FIELD_LABELS[key] || key}...`}
                  onChange={(e) => updateField(key, e.target.value)}
                />
              ) : (
                <Input
                  value={String(value ?? "")}
                  className="h-8 text-sm"
                  placeholder={`Enter ${FIELD_LABELS[key] || key}...`}
                  onChange={(e) => updateField(key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
