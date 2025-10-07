import { getBlogImage } from "@/config/supabaseClient";
import { PostCover } from "@/types/blog-storage";
import { RoutPath } from "@/config/router-config";
import useTransitionRouteTo from "@/hooks/useRouteTransitionTo";
import Card from "@/components/ui-abc/card/card";

const BlocCard = ({ post }: { post: PostCover }) => {
  const navigateTo = useTransitionRouteTo();

  return (
    <Card
      onClick={() => {
        navigateTo(`${RoutPath.BLOG}/${post.id}`);
      }}
      srcImage={getBlogImage(post.cover)}
      title={post.title}
      description={post.description}
    />
  );
};

export default BlocCard;
