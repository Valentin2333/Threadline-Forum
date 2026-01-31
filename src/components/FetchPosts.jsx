// const [posts, setPosts] = useState([]);

//   useEffect(() => {
//     async function loadPosts() {
//       const { data, error } = await supabase
//         .from('posts')
//         .select('id, title, created_at, score, comment_count')
//         .order('created_at', { ascending: false })
//         .limit(10);

//       console.log('posts data:', data);
//       console.log('posts error:', error);

//       if (!error) {
//         setPosts(data);
//       }
//     }

//     loadPosts();
//   }, []);

//   console.log("app running", supabase)
//   return (
//     <>
//       <h1>Newest posts</h1>
//       {posts.map((post) => (
//         <div>
//           {post.title} - score: {post.score} - comments: {post.comment_count}
//         </div>
//       ))}
//     </>
//   )