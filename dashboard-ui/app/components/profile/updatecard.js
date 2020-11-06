import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  ButtonToolbar
} from 'react-bootstrap';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import { showAlert } from '../../actions';

var styles = {
  editCardContainer: {
    position: 'relative'
  },
  loadingIndicatorContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    height: '200px',
    position: 'absolute',
    zIndex: 1
  }
};

class UpdateCardForm extends Component {
  static propTypes = {
    card: PropTypes.any,
    handleSubmit: PropTypes.any,
    handleAbort: PropTypes.any
  }
  state = {
    loading: false,
    record: _.clone(this.props.card),
    currYear: new Date().getFullYear()
  }
  onValueChange = (attr) => (event) => {
    const { record } = this.state;
    record[attr] = event.target.value;
    this.setState({ record });
  }
  onSubmit = (e) => {
    e.preventDefault();
    const { handleSubmit, handleAbort } = this.props;
    const { record } = this.state;
    this.setState({
      loading: true
    });
    const data = {
      customerId: record.customerId,
      cardId: record.id,
      params: _.pick(record, 'name', 'exp_month', 'exp_year')
    };
    handleSubmit(data)
      .then(() => {
        showAlert('success', 'Card updated successfully');
        handleAbort(); // close modal
      })
      .catch(err => {
        this.setState({
          loading: false
        });
        if (err.response && err.response.data) {
          if (typeof err.response.data === 'string') {
            let message = err.response.data;
            showAlert('error', message);
          } else if (err.response && err.response.data && err.response.data.message) {
            let message = err.response.data.message;
            showAlert('error', message);
          } else {
            showAlert('error', 'Card update failed');
          }
        }
      });
  }
  render () {
    const { handleAbort } = this.props;
    const { currYear, record, loading } = this.state;

    return (
      <div style={styles.editCardContainer}>
        {
          loading &&
          <div style={styles.loadingIndicatorContainer}>
            <RefreshIndicator size={35}
              left={135}
              top={0}
              status='loading'
              className='loadermodal' />
          </div>
        }
        <Form onSubmit={this.onSubmit}>
          <FormGroup controlId='cardName'>
            <ControlLabel>Name</ControlLabel>
            <FormControl
              type='text'
              placeholder='John Doe'
              value={record.name || ''}
              onChange={this.onValueChange('name')}
            />
          </FormGroup>
          <FormGroup controlId='expMonthSelect'>
            <ControlLabel>Expiry Month</ControlLabel>
            <FormControl
              componentClass='select'
              value={record.exp_month}
              onChange={this.onValueChange('exp_month')}
              required>
              <option value='select'>--</option>
              {
                Array.apply(null, { length: 12 })
                  .map(Number.call, Number)
                  .map(i => i + 1)
                  .map(val => <option value={val} key={val}> {val} </option>)
              }
            </FormControl>
          </FormGroup>
          <FormGroup controlId='expYearSelect'>
            <ControlLabel>Expiry Year</ControlLabel>
            <FormControl
              componentClass='select'
              value={record.exp_year}
              onChange={this.onValueChange('exp_year')}
              required>
              <option value='select'>----</option>
              {
                Array.apply(null, { length: 20 })
                  .map(Number.call, Number)
                  .map(i => i + currYear)
                  .map(val => <option value={val + ''} key={val}> {val} </option>)
              }
            </FormControl>
          </FormGroup>
          <ButtonToolbar className='pull-right'>
            <Button type='submit' disabled={loading}>Update Card</Button>
            <Button onClick={() => handleAbort()}> Cancel </Button>
          </ButtonToolbar>
        </Form>
      </div>
    );
  }
}

export default UpdateCardForm;
