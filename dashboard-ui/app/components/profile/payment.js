import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import {
  Button,
  ButtonToolbar
} from 'react-bootstrap';
import UpdateCardForm from './updatecard';
import AddCardForm from './addcard';
import CardItem from './creditCard';
import { createPaymentCard, showAlert, updatePaymentCard, removePaymentCard } from '../../actions';
import Footer from '../footer/footer';

import '../../styles/css/payment-page.css';

const NoCards = () => (
  <div style={{ marginVertical: 5 }}>
    <h4 className='text-center text-muted'> No cards here yet. </h4>
  </div>
);

const CardList = ({ cards, updateFn, deleteFn }) => (
  <div className='cardList'>
    {
      cards.map((card, index) => (
        <CardItem
          card={card}
          key={index}
          disableDelete={cards.length === 1}
          editButtonFn={() => updateFn(card)}
          deleteButtonFn={() => deleteFn(card)} />
      ))
    }
  </div>
);

CardList.propTypes = {
  cards: PropTypes.any,
  updateFn: PropTypes.any,
  deleteFn: PropTypes.any
};

export class Payment extends React.Component {
  static propTypes = {
    removeCard: PropTypes.any,
    cards: PropTypes.any,
    addCard: PropTypes.any,
    updateCard: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      cardToUpdate: {},
      cardToDelete: {},
      openUpdateCardDialog: false,
      openDeleteDialog: false,
      openAddDialog: false,
      removingCard: false
    };
  }

  static get contextTypes () {
    return {
      router: React.PropTypes.object.isRequired
    };
  }

  updateCard = (card) => {
    this.setState({
      cardToUpdate: card,
      openUpdateCardDialog: true
    });
  }

  closeUpdateForm = () => {
    this.setState({
      openUpdateCardDialog: false,
      cardToUpdate: {}
    });
  }

  openDeleteDialogFn = (card) => {
    this.setState({
      openDeleteDialog: true,
      cardToDelete: card
    });
  }

  closeDeleteDialog = () => {
    this.setState({
      openDeleteDialog: false,
      cardToDelete: {}
    });
  }

  handleCardRemoval = () => {
    const reactComponent = this;
    reactComponent.setState({
      removingCard: true
    });
    const { cardToDelete } = this.state;
    const data = {
      customerId: cardToDelete.customerId,
      cardId: cardToDelete.id
    };
    const { removeCard } = this.props;

    removeCard(data).then(() => {
      reactComponent.setState({
        removingCard: false
      });
      showAlert('success', 'Removed card successfully');
      reactComponent.closeDeleteDialog();
    }).catch(() => {
      reactComponent.setState({
        removingCard: false
      });
      showAlert('error', 'Error removing card');
    });
  }

  openAddDialogFn = () => {
    this.setState({
      openAddDialog: true
    });
  }

  closeAddDialog = () => {
    this.setState({
      openAddDialog: false
    });
  }

  render () {
    return (
      <div className='paymentPage'>
        <div className='paymentPage__cardsSection'>
          <div className='paymentPage__cardsSection__header'>
            <div className='cardsSection__header__top'>
              <h1 className='cardsSection__header__top__title'>
                Payment Methods
              </h1>
            </div>

            <button
              className='cardsSection__header__addBtn'
              onClick={this.openAddDialogFn}
            >
              <div>+ Add Card</div>
            </button>
          </div>
          <div className='paymentPage__cardsSection__cardListContainer'>
            {!this.props.cards.length && <NoCards />}
            {!!this.props.cards.length && (
              <CardList
                cards={this.props.cards}
                updateFn={this.updateCard}
                deleteFn={this.openDeleteDialogFn}
              />
            )}
            <Dialog
              bodyStyle={{
                padding: '0px'
              }}
              contentStyle={{ width: '50%', maxWidth: '480px' }}
              open={this.state.openAddDialog}
              modal={false}
              onRequestClose={this.closeAddDialog}
            >
              <AddCardForm
                handleSubmit={this.props.addCard}
                handleAbort={this.closeAddDialog}
              />
            </Dialog>
            <Dialog
              open={this.state.openUpdateCardDialog}
              title='Update Card Information'
              contentStyle={{ width: '50%', maxWidth: 'none' }}
              modal
              onRequestClose={this.closeUpdateForm}
            >
              <UpdateCardForm
                card={this.state.cardToUpdate}
                handleSubmit={this.props.updateCard}
                handleAbort={this.closeUpdateForm}
              />
            </Dialog>
            <Dialog
              open={this.state.openDeleteDialog}
              title='Remove Card'
              contentStyle={{ width: '50%', maxWidth: 'none' }}
              modal
              onRequestClose={this.closeDeleteDialog}
            >
              <p>
                {' '}
                Are you sure you want to remove{' '}
                <b>{this.state.cardToDelete.last4} </b> card?{' '}
              </p>
              <ButtonToolbar className='pull-right'>
                <Button
                  bsStyle='danger'
                  onClick={this.handleCardRemoval}
                  disabled={this.state.removingCard}
                >
                  {' '}
                  Yes, Remove it!{' '}
                </Button>
                <Button onClick={this.closeDeleteDialog}>
                  {' '}
                  No, Thanks{' '}
                </Button>
              </ButtonToolbar>
            </Dialog>
          </div>
        </div>
        <Footer id='app-footer' />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loading: state.loader.loading,
    cards: state.user.payments.length ? state.user.payments.reduce((prev, curr) => {
      const sources = curr.sources.map(source => {
        source.customerId = curr.customerId;
        return source;
      });
      return prev.concat(sources);
    }, []) : []
  };
};

const mapActionToProps = (dispatch) => {
  return {
    addCard: (data) => dispatch(createPaymentCard(data)),
    updateCard: (data) => dispatch(updatePaymentCard(data)),
    removeCard: (data) => dispatch(removePaymentCard(data))
  };
};

export default connect(mapStateToProps, mapActionToProps)(Payment);
