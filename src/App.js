import React, { Component } from 'react';
import Hand from './components/Hand.js';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameStarted: false,
      activeGame: false,
      deckId: '',
      dealerHand: [],
      dealerScore: 0,
      dealerHasAce: false,
      dealerHasBlackjack: false,
      dealerSoft: false,
      playerHand: [],
      playerScore: 0,
      playerHasAce: false,
      playerHasBlackjack: false,
      playerCoins: 0,
      wait: false,
    };
  }
  
  componentDidMount() {
    fetch(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`)
      .then((res) => res.json())
      .then((json) => {
        this.setState({
          deckId: json.deck_id,
          playerCoins: 100,
        });
      });
  }

  handleNewGame() {
    fetch(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`)
      .then((res) => res.json())
      .then((json) => {
        this.setState({
          deckId: json.deck_id,
        });
      });
    this.setState({
      gameStarted: false,
      activeGame: false,
      dealerHand: [],
      dealerScore: 0,
      dealerInitialScore: 0,
      dealerHasAce: false,
      dealerHasBlackjack: false,
      playerHand: [],
      playerScore: 0,
      playerHasAce: false,
      playerHasBlackjack: false,
      gameMessage: 'Shuffling Deck',
    });
  }
  
  cardValue(value) {
    const cardValues = {
      ACE: 11,
      KING: 10,
      QUEEN: 10,
      JACK: 10,
      10: 10,
      9: 9,
      8: 8,
      7: 7,
      6: 6,
      5: 5,
      4: 4,
      3: 3,
      2: 2,
    };
    return cardValues[value];
  }

  handleDealHand() {
      this.setState({
        gameMessage: 'Will you hit or stand?',
      });
      fetch(
        `https://deckofcardsapi.com/api/deck/${this.state.deckId}/draw/?count=4`
      )
        .then((res) => res.json())
        .then((json) => {
          console.log(json.remaining);
          if (json.remaining < 10) {
            fetch(
              `https://deckofcardsapi.com/api/deck/${this.state.deckId}/shuffle/`
            )
              .then((res) => res.json())
              .then((json) => {
                console.log(json);
                console.log('Deck reshuffled!');
              });
          }
          
          const value0 = this.cardValue(json.cards[0].value);
          const value1 = this.cardValue(json.cards[1].value);
          const value2 = this.cardValue(json.cards[2].value);
          const value3 = this.cardValue(json.cards[3].value);
          
          if (value0 === 11 && value2 === 11) {
            value0 = 1;
            this.setState({
              playerHasAce: true
            });
          } else if (value0 === 11 || value2 === 11) {
            this.setState({
              playerHasAce: true,
            });
          }
          
          if (value1 === 11 && value3 === 11) {
            value1 = 1;
            this.setState({
              dealerHasAce: true,
            });
          } else if (value1 === 11 || value3 === 11) {
            this.setState({
              dealerHasAce: true,
            });
          }
          
          this.setState({
            gameStarted: true,
            activeGame: true,
            playerCoins: this.state.playerCoins - 1,
            playerHand: [
                json.cards[0],
                json.cards[2],
            ],
            playerScore: (value0 + value2),
            dealerHand: [
                json.cards[1],
                json.cards[3],
            ],
            dealerScore: value1 + value3,
            dealerInitialScore: value3,
          }, () => 
          this.checkBlackJack());
        })
        .catch((err) => console.log(err));
        console.log(this.state.activeGame);
  }

  checkBlackJack() {
    if (this.state.playerScore === 21) {
      this.setState({
        playerHasBlackjack: true,
      });
    }
   
    if (this.state.dealerScore === 21) {
      this.setState({
        dealerHasBlackjack: true,
      });
    }
    this.setState({
      wait: true,
    }, () => 
          this.handleBlackJack());
  }
  
  handleBlackJack() {
    if (this.state.playerHasBlackjack && this.state.dealerHasBlackjack) {
      this.setState({
        activeGame: false,
        playerCoins: this.state.playerCoins + 1,
        gameMessage: 'Tie! You both have a Blackjack!',
      });
    } else if (this.state.playerHasBlackjack) {
      this.setState({
        activeGame: false,
        playerCoins: this.state.playerCoins + 5,
        gameMessage: "Blackjack!, Here's 5 Coins",
      });
    } else if (this.state.dealerHasBlackjack) {
      this.setState({
        activeGame: false,
        gameMessage: 'Dealer has a Blackjack!',
      });
    }
  }

  checkWinner() {
    if (this.state.playerScore > 21) {
      this.setState({
        gameMessage: 'You busted, Dealer wins',
      });
    } else if (this.state.dealerScore > 21) {
      this.setState({
        playerCoins: this.state.playerCoins + 2,
        gameMessage: "Dealer busted, You win! Here's 2 Coins",
      });
    } else if (
      this.state.playerScore > this.state.dealerScore &&
      this.state.playerScore <= 21
    ) {
      this.setState({
        playerCoins: this.state.playerCoins + 2,
        gameMessage: "You win! Here's 2 Coins",
      });
    } else if (this.state.playerScore === this.state.dealerScore) {
      this.setState({
        playerCoins: this.state.playerCoins + 1,
        gameMessage: "We tied! I'll give you back your bet",
      });
    } else {
      this.setState({
        gameMessage: 'You lost!',
      });
    }
  }
  
  handleScore() {
    if (this.state.playerHasAce && this.state.playerScore > 21) {
      this.setState({
        playerScore: this.state.playerScore - 10,
        playerHasAce: false,
      });
    } else if (this.state.playerScore > 21) {
      this.setState({
        activeGame: false,
      }, () =>
      this.checkWinner());
    } else if (this.state.playerScore == 21){
      this.handleDealerPlay();
    }
  }

  handleDrawCardEvent = (event) => {
    if (this.state.playerScore < 21) {
      fetch(
        `https://deckofcardsapi.com/api/deck/${this.state.deckId}/draw/?count=1`
      )
        .then((res) => res.json())
        .then((json) => {
          const newValue = this.cardValue(json.cards[0].value);
          if (newValue === 11 && this.state.playerHasAce) {
            this.setState({
              playerScore: this.state.playerScore - 10,
              playerHasAce: true,
            });
          } else if (newValue === 11) {
            if (this.state.playerScore + newValue > 21) {
              newValue = 1
            } else {
              this.setState({
                playerHasAce: true,
              });
            }
          }
          this.setState({
            playerHand: [...this.state.playerHand, json.cards[0]],
            playerScore: this.state.playerScore + newValue,
          }, () => 
          this.handleScore());
        })
        .catch((err) => console.log(err));
    }
  };
  

  handleDealerPlay = (event) => {
    if (this.state.dealerHasAce && this.state.dealerScore === 17) {
      fetch(
        `https://deckofcardsapi.com/api/deck/${this.state.deckId}/draw/?count=1`
      )
        .then((res) => res.json())
        .then((json) => {
          const softHit = this.cardValue(json.cards[0].value);
          this.setState({
            dealerHand: [...this.state.dealerHand, json.cards[0]],
            dealerScore: this.state.dealerScore + softHit,
          }, () => 
          this.handleDealerPlay());
        });
    } else if (this.state.dealerScore > 21 && this.state.dealerHasAce) {
      this.setState({
        dealerScore: this.state.dealerScore - 10,
        dealerHasAce: false,
      }, () => 
          this.handleDealerPlay());
    } else if (this.state.dealerScore < 17 && this.state.dealerScore < this.state.playerScore) {
      fetch(
        `https://deckofcardsapi.com/api/deck/${this.state.deckId}/draw/?count=1`
      )
        .then((res) => res.json())
        .then((json) => {
          const newValue = this.cardValue(json.cards[0].value);
          if (newValue === 11 && this.state.dealerHasAce) {
            this.setState({
              dealerScore: this.state.dealerScore - 10,
              dealerHasAce: true,
            });
          } else if (newValue === 11) {
            this.setState({
              dealerHasAce: true,
            });
          }
          this.setState({
            activeGame: false,
            dealerHand: [...this.state.dealerHand, json.cards[0]],
            dealerScore: this.state.dealerScore + newValue,
          }, () => 
          this.handleDealerPlay());
        });
    } else {
      this.setState({
        activeGame: false,
      });
      this.checkWinner();
    }
  };

  handleDealEvent = (event) => {
    this.setState({
      activeGame: false,
      dealerHand: [],
      dealerScore: 0,
      dealerInitialScore: 0,
      dealerHasAce: false,
      dealerHasBlackjack: false,
      playerHand: [],
      playerScore: 0,
      playerHasAce: false,
      playerHasBlackjack: false,
      gameMessage: '',
    });
    this.handleDealHand();
  };

  render() {
    return (
      <div className='App'>
        <div className='gameHeader'>
          <h1>Blackjack</h1>
          <h2>Dealer hits on soft 17, Buy-in is 1 coin</h2>
          <h4>Coins remaining: {this.state.playerCoins}</h4>
          {!this.state.activeGame ? (
            <div>
              <button className='redBtn' onClick={() => this.handleNewGame()}>
                Shuffle Deck
              </button>
            </div>
          ) : (
            ''
          )}
        </div>
        {this.state.gameMessage ? (
          <h2>{this.state.gameMessage}</h2>
        ): (
          ''
        )}
        {this.state.gameStarted ? (
          <div className='hands-container'>
            <Hand
              name='Dealer: '
              cards={this.state.dealerHand}
              score={this.state.dealerScore}
              activeGame={this.state.activeGame}
              dealerInitialScore={this.state.dealerInitialScore}
            />
            <Hand
              name='Player: '
              cards={this.state.playerHand}
              score={this.state.playerScore}
              activeGame={this.state.activeGame}
              handleDrawCardEvent={this.handleDrawCardEvent}
              handleDealerPlay={this.handleDealerPlay}
              handleDealEvent={this.handleDealEvent}
            />
          </div>
        ) : (
          ''
        )}
        {!this.state.gameStarted ? (
          <button onClick={() => this.handleDealHand()}>
            Deal!
          </button>
        ) : (
          ''
        )}
        <br></br>
        <br></br>
        <a href="https://github.com/duane2222/blackjack"> Github Repository</a>
      </div>
    );
  }
}
