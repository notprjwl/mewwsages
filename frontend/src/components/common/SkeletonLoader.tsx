import { Skeleton } from "@chakra-ui/react";

interface ISkeletonLoaderProps {
  count: number;
  height: string;
  width?: string;
}
const SkeletonLoader: React.FunctionComponent<ISkeletonLoaderProps> = ({ count, height, width }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <Skeleton key={i} height={height} width={{base: "full"}} borderRadius={4} startColor="blackAlpha.400" endColor="whiteAlpha.400" />
      ))}
    </>
  );
};

export default SkeletonLoader;
