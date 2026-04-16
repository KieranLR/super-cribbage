extends RefCounted
class_name MatchState

const PHASE_DEAL := "deal"
const PHASE_DISCARD := "discard"
const PHASE_STARTER := "starter"
const PHASE_PEGGING := "pegging"
const PHASE_COUNT_HANDS := "count_hands"
const PHASE_COUNT_CRIB := "count_crib"
const PHASE_ROUND_OVER := "round_over"
const PHASE_MATCH_OVER := "match_over"

var player: PlayerState
var opponent: PlayerState
var deck: Deck
var crib: Array[Card] = []
var starter_card: Card = null
var pegging_pile: Array[Card] = []
var pegging_total: int = 0
var current_phase: String = PHASE_DEAL
var current_turn: String = "player"
var winner: String = ""

func _init() -> void:
	player = PlayerState.new("Player")
	opponent = PlayerState.new("Bot")
	deck = Deck.new()

func reset_round() -> void:
	deck.reset()
	deck.shuffle_deck()
	crib.clear()
	starter_card = null
	pegging_pile.clear()
	pegging_total = 0
	current_phase = PHASE_DEAL
	current_turn = "player"
	player.reset_for_round()
	opponent.reset_for_round()

func get_current_player_state() -> PlayerState:
	return player if current_turn == "player" else opponent

func get_waiting_player_state() -> PlayerState:
	return opponent if current_turn == "player" else player

func switch_turn() -> void:
	current_turn = "opponent" if current_turn == "player" else "player"
