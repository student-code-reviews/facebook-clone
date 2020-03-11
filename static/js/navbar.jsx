"use strict";

const {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Button,
  ThemeProvider,
  createMuiTheme,
  colors
} = MaterialUI;


const muiTheme = createMuiTheme({
  palette: {
    primary: colors.lightBlue
  }
});

class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {login_email: '', login_password: ''};

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validForm = this.validForm.bind(this);
  }

  validForm(){
    return this.state.login_email !== '' && this.state.login_password !== '';
  }

  handleInputChange(event) {
    const name = event.target.name;
    const value = event.target.value;
    this.setState({[name]: value});
  }

  async handleSubmit(event){
    event.preventDefault();

    if (this.validForm()){
      const response = await axios.post(`${window.location}login`, { 
        email: this.state.login_email,
        password: this.state.login_password
      });

      console.log(response.data);
    }

  }

  render(){
    return(
      <React.Fragment>
        <ThemeProvider theme={muiTheme}>
          <AppBar position="static" title="Facebook Clone">
            <Toolbar>
              <Typography variant="h5">
                Facebook Clone
              </Typography>
              <form action='/login' method="POST" id="login-form">
                <TextField id="login-email" name="login_email" label="Email" 
                  required className="login-text"
                  onChange={this.handleInputChange}
                />
                <TextField id="login-password" label="Password" 
                  name="login_password" type="password"
                  className="login-text" onChange={this.handleInputChange}
                  autoComplete="current_password" required />
                <Button variant="contained" size="small"
                  onClick={this.handleSubmit} className="login-button">
                  Log In
                </Button>
              </form>
            </Toolbar>
          </AppBar>
        </ThemeProvider>
      </React.Fragment>
    );
  }
}

ReactDOM.render(<Navbar />, document.querySelector("#navigation"));