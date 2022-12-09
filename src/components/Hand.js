import React, { Component } from 'react';
import Card from './Card.js';

import blankCard from '../images/cardback.png';

export default class Hand extends Component {
  render() {
    let cards;
    if (this.props.cards.length) {
      cards = this.props.cards.map((card) => (
        <Card key={card.code} card={card} history={this.props.history} />
      ));
    }

    return (
      <div className='Hand'>
        {this.props.name === 'Dealer: ' ? (
          <div className='hand-container'>
            {this.props.activeGame ? (
              <h3>
                {this.props.name} {this.props.dealerInitialScore}
              </h3>
            ) : (
              <h3>
                {this.props.name} {this.props.score}
              </h3>
            )}
            {this.props.cards.length == 0 ? (
              <div className='cards-container'>
                <img src={blankCard} alt='cardback' className='blankCard' />
                <img src={blankCard} alt='cardback' className='blankCard' />
              </div>
            ) : (
              ''
            )}
            {this.props.activeGame ? (
              <div className='cards-container'>
                <img src={blankCard} alt='cardback' className='blankCard' />
                {cards[1]}
              </div>
            ) : (
              <div className='cards-container'>{cards}</div>
            )}
          </div>
        ) : (
          <div className='hand-container'>
            <h3>
              {this.props.name} {this.props.score}
            </h3>
            {this.props.cards.length == 0 ? (
              <div className='cards-container'>
                <img src={blankCard} alt='cardback' className='blankCard' />
                <img src={blankCard} alt='cardback' className='blankCard' />
              </div>
            ) : (
              ''
            )}
            <div className='cards-container'>{cards}</div>
            {this.props.activeGame ? (
              <div className='playingButtons'>
                <button
                  onClick={(event) => this.props.handleDrawCardEvent(event)}
                >
                  Hit
                </button>
                <button
                  onClick={(event) => this.props.handleDealerPlay(event)}
                >
                  Stand
                </button>
              </div>
            ) : (
              <button
                onClick={(event) => this.props.handleDealEvent(event)}
              >
                Deal
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
}