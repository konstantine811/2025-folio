import { useMemo, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { remarkDefaultFenceLang } from "@/utils/remark-default-fence-lang";
import { cn } from "@/utils/classname";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import ArticleHeading from "@/components/page-partials/pages/blog/ArticleHeading";
import type {
  CanvasImageItem,
  LinkData,
  NodeHeadingLevel,
  Project,
} from "../types/types";
import { MarkdownResolvingZoomableImg } from "../node-canvas/components/MarkdownResolvingZoomableImg";
import { resolveNodeHeadingLevel } from "../node-canvas/constants";
import {
  descriptionFromBlocks,
  deriveMarkdownBlocks,
} from "../node-canvas/utils/node-markdown-blocks";
import {
  buildArticleSectionsFromNodes,
  buildTocFromSections,
  type ArticleSection,
} from "../utils/article-node-tree";
import {
  buildCanvasCanvasAdjacency,
  canvasImagesForArticleNode,
} from "../utils/article-canvas-images";
import { makeNodeWriterArticleMarkdownComponents } from "./node-writer-article-markdown";

interface EditorViewProps {
  project: Project;
}

function sectionHeadingClass(
  level: NodeHeadingLevel,
  depth: number,
  isFirstRoot: boolean,
): string {
  const firstTight =
    isFirstRoot && depth === 0 ? "mt-4" : undefined;
  const scroll = "scroll-mt-24";
  switch (level) {
    case 1:
      return cn(
        scroll,
        "text-4xl font-bold text-primary md:text-5xl mb-6",
        firstTight ?? "mt-10",
      );
    case 2:
      return cn(
        scroll,
        "text-3xl font-semibold text-primary md:text-4xl mb-5 border-b border-card pb-2",
        firstTight ?? "mt-8",
      );
    case 3:
      return cn(
        scroll,
        "text-2xl font-semibold text-primary md:text-3xl mb-4",
        firstTight ?? "mt-6",
      );
    case 4:
      return cn(
        scroll,
        "text-xl font-medium text-primary md:text-2xl mb-3",
        firstTight ?? "mt-5",
      );
    case 5:
      return cn(
        scroll,
        "text-lg font-medium text-primary md:text-xl mb-2",
        firstTight ?? "mt-4",
      );
    case 6:
    default:
      return cn(
        scroll,
        "text-base font-medium uppercase tracking-wide text-primary md:text-lg mb-2",
        firstTight ?? "mt-3",
      );
  }
}

function SectionHeading({
  level,
  nodeId,
  depth,
  isFirstRoot,
  children,
}: {
  level: NodeHeadingLevel;
  nodeId: string;
  depth: number;
  isFirstRoot: boolean;
  children: ReactNode;
}) {
  const id = `nw-sec-${nodeId}`;
  const cls = sectionHeadingClass(level, depth, isFirstRoot);
  switch (level) {
    case 1:
      return (
        <h1 id={id} className={cls}>
          {children}
        </h1>
      );
    case 2:
      return (
        <h2 id={id} className={cls}>
          {children}
        </h2>
      );
    case 3:
      return (
        <h3 id={id} className={cls}>
          {children}
        </h3>
      );
    case 4:
      return (
        <h4 id={id} className={cls}>
          {children}
        </h4>
      );
    case 5:
      return (
        <h5 id={id} className={cls}>
          {children}
        </h5>
      );
    case 6:
    default:
      return (
        <h6 id={id} className={cls}>
          {children}
        </h6>
      );
  }
}

function ArticleSectionView({
  section,
  canvasById,
  canvasAdj,
  links,
  isFirstRoot,
}: {
  section: ArticleSection;
  canvasById: Map<string, CanvasImageItem>;
  canvasAdj: Map<string, string[]>;
  links: LinkData[];
  isFirstRoot: boolean;
}) {
  const level = resolveNodeHeadingLevel(section.node.headingLevel);
  const body = descriptionFromBlocks(deriveMarkdownBlocks(section.node));
  const hasBody = body.trim().length > 0;

  const mdComponents = useMemo(
    () => makeNodeWriterArticleMarkdownComponents(section.node.id),
    [section.node.id],
  );

  const canvasImages = canvasImagesForArticleNode(
    section.node.id,
    links,
    canvasById,
    canvasAdj,
  );

  return (
    <article
      className={cn(section.depth > 0 && "mt-6 pl-1")}
      id={`nw-article-${section.node.id}`}
    >
      {/* Спочатку заголовок + текст ноди; зображення та дочірні — після, щоб контент не «їхав» вниз. */}
      <div className="space-y-4">
        <SectionHeading
          level={level}
          nodeId={section.node.id}
          depth={section.depth}
          isFirstRoot={isFirstRoot}
        >
          {section.node.label}
        </SectionHeading>

        {hasBody ? (
          <div className="markdown-node-preview text-foreground">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkDefaultFenceLang]}
              rehypePlugins={[rehypeRaw]}
              components={mdComponents}
            >
              {body}
            </ReactMarkdown>
          </div>
        ) : null}
      </div>

      {section.node.imageUrl?.trim() ? (
        <div className="mb-4 mt-4">
          <MarkdownResolvingZoomableImg
            src={section.node.imageUrl}
            className="max-h-[min(40vh,26rem)] w-full object-contain"
          />
        </div>
      ) : null}

      {canvasImages.map((img) => (
        <figure key={img.id} className="mb-4">
          <MarkdownResolvingZoomableImg
            src={img.url}
            className="max-h-[min(40vh,26rem)] w-full object-contain"
          />
          {img.title?.trim() ? (
            <figcaption className="mt-1 text-center text-[12px] text-muted-foreground">
              {img.title}
            </figcaption>
          ) : null}
        </figure>
      ))}

      {section.children.length > 0 ? (
        <div className="mt-8 space-y-6 pl-1">
          {section.children.map((c) => (
            <ArticleSectionView
              key={c.node.id}
              section={c}
              canvasById={canvasById}
              canvasAdj={canvasAdj}
              links={links}
              isFirstRoot={false}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

const EditorView = ({ project }: EditorViewProps) => {
  const hSize = useHeaderSizeStore((state) => state.size);

  const canvasById = useMemo(
    () => new Map(project.canvasImages.map((c) => [c.id, c])),
    [project.canvasImages],
  );

  const canvasAdj = useMemo(
    () => buildCanvasCanvasAdjacency(project.links, canvasById),
    [project.links, canvasById],
  );

  const sections = useMemo(
    () => buildArticleSectionsFromNodes(project.nodes, project.links),
    [project.nodes, project.links],
  );

  const tocHeadings = useMemo(
    () => buildTocFromSections(sections),
    [sections],
  );

  return (
    <div
      className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-y-auto bg-background pb-20"
      style={{ minHeight: `calc(100vh - ${hSize}px)` }}
    >
      <div className="grid grid-cols-10 gap-4 px-5 sm:px-10">
        <div
          className={cn(
            "col-span-10 text-foreground",
            tocHeadings.length > 0 ? "lg:col-span-8" : "lg:col-span-10",
            "xl:col-start-3 xl:col-span-6",
          )}
        >
          <header className="mb-10">
            <p className="mono mb-2 text-[9px] font-medium uppercase italic tracking-widest text-muted-foreground">
              Текстовий протокол
            </p>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-foreground md:text-5xl">
              {project.title}
            </h1>
            <p className="mono mt-2 text-[9px] uppercase tracking-widest text-muted-foreground">
              З нод документа
            </p>
          </header>

          {project.nodes.length === 0 ? (
            <p className="text-muted-foreground">
              Немає нод у документі — додайте ноди на полотні, щоб зібрати текст
              тут.
            </p>
          ) : (
            <div className="space-y-10">
              {sections.map((s, i) => (
                <ArticleSectionView
                  key={s.node.id}
                  section={s}
                  canvasById={canvasById}
                  canvasAdj={canvasAdj}
                  links={project.links}
                  isFirstRoot={i === 0}
                />
              ))}
            </div>
          )}
        </div>

        {tocHeadings.length > 0 && (
          <div className="relative col-span-2 hidden lg:block">
            <div className="sticky" style={{ top: `${hSize}px` }}>
              <ArticleHeading
                title={project.title}
                headings={tocHeadings}
                scrollBehavior="into-view"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorView;
