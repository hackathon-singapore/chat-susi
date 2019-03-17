import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import appActions from '../../redux/actions/app';
import uiActions from '../../redux/actions/ui';

/* Material-UI*/
import Close from 'material-ui/svg-icons/navigation/close';
import Dialog from 'material-ui/Dialog';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import TextField from 'material-ui/TextField';

/* Utils*/

/* CSS*/

const styles = {
  containerStyle: {
    width: '100%',
    textAlign: 'center',
    padding: '10px',
  },
  closingStyle: {
    position: 'absolute',
    zIndex: 1200,
    fill: '#444',
    width: '26px',
    height: '26px',
    right: '10px',
    top: '10px',
    cursor: 'pointer',
  },
  bodyStyle: {
    padding: 0,
    textAlign: 'center',
  },
  underlineFocusStyle: {
    color: '#4285f4',
  },
};

class Translate extends Component {
  static propTypes = {
    history: PropTypes.object,
    openSnackBar: PropTypes.func,
    actions: PropTypes.object,
    modalProps: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      text: '',
      translate: '',
      validForm: false,
      loading: false,
    };
  }

  closeDialog = () => {
    const { actions } = this.props;
    this.setState({
      text: '',
      indi: '',
      success: false,
      validForm: false,
      loading: false,
    });
    actions.closeModal();
  };

  handleTextChange = (event) => {
    const {value} = event.target
    if(event.target.name === 'text') {
        this.setState({text: value}, () => this.setState({validForm: (this.state.text.length.trim() !== 0 && this.state.translate.length.trim() !== 0) ? true : false}))
    }
    else {
        this.setState({translate: value}, () => this.setState({validForm: (this.state.text.length.trim() !== 0 && this.state.translate.length.trim() !== 0) ? true : false}))
    }
  }

  handleSubmit = event => {
    event.preventDefault();

    const { openSnackBar, actions } = this.props;
    let { email } = this.state;
    email = email.trim();
    let validEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

    this.setState({ loading: true });

    if (email && validEmail) {
      this.setState({ loading: true });
      actions
        .getForgotPassword({ email })
        .then(({ payload }) => {
          let snackBarMessage = payload.message;
          let success;
          if (payload.accepted) {
            success = true;
          } else {
            success = false;
            snackBarMessage = 'Please Try Again';
          }
          this.setState(
            {
              success,
              loading: false,
            },
            () => {
              if (success) {
                setTimeout(() => {
                  this.closeDialog();
                }, 2000);
              }
            },
          );
          openSnackBar({
            snackBarMessage,
            snackBarDuration: 4000,
          });
        })
        .catch(error => {
          debugger;
          this.setState({
            loading: false,
            success: false,
          });
          if (error.statusCode === 422) {
            openSnackBar({
              snackBarMessage: 'Email does not exist.',
              snackBarDuration: 4000,
            });
          } else {
            openSnackBar({
              snackBarMessage: 'Failed. Try Again',
              snackBarDuration: 4000,
            });
          }
        });
    }
  };

  render() {
    const { translation, text, emailErrorMessage, validForm, loading } = this.state;
    const { modalProps, actions } = this.props;
    const {
      containerStyle,
      closingStyle,
      bodyStyle,
    } = styles;

    return (
      <Dialog
        modal={false}
        open={
          modalProps &&
          modalProps.isModalOpen &&
          modalProps.modalType === 'translate'
        }
        onRequestClose={actions.closeModal}
        autoScrollBodyContent={true}
        bodyStyle={bodyStyle}
        contentStyle={{ width: '35%', minWidth: '300px' }}
      >
        <div className="forgotPasswordForm">
          <Paper zDepth={0} style={containerStyle}>
            <h3>Provide translation</h3>
            <form onSubmit={this.handleSubmit}>
                <div>
                    <TextField
                    name="text"
                    floatingLabelText="English Text"
                    errorText={emailErrorMessage}
                    value={text}
                    onChange={this.handleTextChange}
                    underlineFocusStyle={styles.underlineFocusStyle}
                    floatingLabelFocusStyle={styles.underlineFocusStyle}
                    fullWidth
                    />
                </div>
                <TextField
                    name="translate"
                    floatingLabelText="Text in Indigineous Language"
                    errorText={emailErrorMessage}
                    value={translation}
                    onChange={this.handleTextChange}
                    underlineFocusStyle={styles.underlineFocusStyle}
                    floatingLabelFocusStyle={styles.underlineFocusStyle}
                    fullWidth
                />
                <div>
                    <RaisedButton
                    type="submit"
                    label={!loading ? 'Send' : ''}
                    labelColor="#fff"
                    style={{ margin: '25px 0 0 0 ' }}
                    disabled={!validForm}
                    icon={loading ? <CircularProgress size={24} /> : undefined}
                    />
                </div>
            </form>
          </Paper>
        </div>
        <Close style={closingStyle} onClick={this.closeDialog} />
      </Dialog>
    );
  }
}

function mapStateToProps(store) {
  return {
    ...store.ui,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...appActions, ...uiActions }, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Translate);
