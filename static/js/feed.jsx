"use strict";

const {
  CircularProgress
} = MaterialUI

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark'
  },
  spacing: 2
});

class Loading extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    return(
      <React.Fragment>
        <CircularProgress style={{ marginTop: 15 }}/>
      </React.Fragment>
    )
  }
}

class Feed extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isLoaded: false,
      posts: [],
      newPostMessage: ''
    }

    this.addNewPost = this.addNewPost.bind(this);
    this.handleNewPostInputChange = this.handleNewPostInputChange.bind(this);
  }

  componentDidMount() {
    const fullUrl = this.props.userProfile ? 
              `${window.location.origin}/posts_for_user_feed` :
              `${window.location.origin}/posts_for_feed`
    axios.get(fullUrl)
      .then((response) => {
        let posts_to_load = Array.isArray(response.data) ? response.data : [];
        this.setState({
          isLoaded: true,
          posts: posts_to_load
        })
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleNewPostInputChange(event){
    this.setState({message: event.target.value});
  }

  async addNewPost(){
    const userId = this.props.userId || '';
    const message = this.state.message;
    if (message && userId) {
      const response = await axios.post(`${window.location.origin}/add_post`, {
        user_id: userId,
        message: message
      });

      if (response.status === 200 && response.data.hasOwnProperty("success")){
        if (response.data["success"] && response.data["post"]){
          const existingPosts = this.state.posts;
          const post = response.data["post"];
          existingPosts.push(post)
          this.setState({
            posts: existingPosts
          });
        }
      }
    }
  }

  render(){
    const { isLoaded, posts } = this.state
    let element = <Loading />;
    if (isLoaded){
      const postsToLoad = []
      for (const post of posts){
        postsToLoad.push(
          <Post key={post.post_id}
            post={post} 
            post_id={post.post_id}
            userId={this.props.userId} 
            message={post.message}
            posted_on={post.posted_on}
            comments={post.comments} />
        );
      }

      element = postsToLoad;
    }
    return(
      <div className="feed-centered">
        <ThemeProvider theme={darkTheme}>
          <AddPostSection userId={this.props.userId} 
            addNewPost={this.addNewPost}
            handleNewPostInputChange={this.handleNewPostInputChange} />
          {element}
        </ThemeProvider>
      </div>
    );
  }
}

