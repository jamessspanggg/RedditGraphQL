import {withUrqlClient} from 'next-urql';
import {createUrqlClient} from '../../utils/createUrqlClient';
import NavBar from '../components/NavBar';
import {usePostsQuery} from '../generated/graphql';

const Index = () => {
  const [{data}] = usePostsQuery();
  return (
    <>
      <NavBar />
      <div>hello world</div>
      {data && data.posts.map((post) => <div key={post.id}>{post.title}</div>)}
    </>
  );
};

export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
