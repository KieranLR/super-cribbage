extends Control

const PlayingCardScene = preload("res://src/ui/components/PlayingCard.tscn")

var flow := MatchFlow.new()
var state: MatchState
var selected_discards: Array[Card] = []

@onready var phase_label: Label = %PhaseLabel
@onready var score_label: Label = %ScoreLabel
@onready var starter_card_node: Control = %StarterCard
@onready var player_hand_cards: HBoxContainer = %PlayerHandCards
@onready var opponent_hand_cards: HBoxContainer = %OpponentHandCards
@onready var crib_cards: HBoxContainer = %CribCards
@onready var pegging_total_label: Label = %PeggingTotalLabel
@onready var pegging_pile_cards: Control = %PeggingPileCards
@onready var info_label: Label = %InfoLabel
@onready var discard_button: Button = %DiscardButton
@onready var play_first_button: Button = %PlayFirstButton
@onready var bot_turn_button: Button = %BotTurnButton
@onready var menu_button: Button = %MenuButton

func _ready() -> void:
	discard_button.pressed.connect(_on_discard_pressed)
	play_first_button.pressed.connect(_on_play_first_pressed)
	bot_turn_button.pressed.connect(_on_bot_turn_pressed)
	menu_button.pressed.connect(_on_menu_pressed)

	state = flow.start_new_match()
	_refresh_ui()

func _refresh_ui() -> void:
	phase_label.text = "Phase: %s" % state.current_phase
	score_label.text = "Score - Player: %d | Bot: %d" % [state.player.score, state.opponent.score]
	
	var starter_cards: Array[Card] = []
	if state.starter_card:
		starter_cards.append(state.starter_card)
	_update_card_display(starter_card_node, starter_cards)
	var cards_to_show_player: Array[Card] = state.player.hand
	var cards_to_show_opponent: Array[Card] = state.opponent.hand
	var cards_to_show_crib: Array[Card] = []
	if state.current_phase == MatchState.PHASE_COUNT_CRIB or state.current_phase == MatchState.PHASE_ROUND_OVER:
		cards_to_show_crib = state.crib

	if state.current_phase == MatchState.PHASE_COUNT_PONE or state.current_phase == MatchState.PHASE_COUNT_DEALER or state.current_phase == MatchState.PHASE_COUNT_CRIB or state.current_phase == MatchState.PHASE_ROUND_OVER:
		cards_to_show_player = state.player.played_cards
		cards_to_show_opponent = state.opponent.played_cards

	_update_card_display(player_hand_cards, cards_to_show_player)
	_update_card_display(opponent_hand_cards, cards_to_show_opponent)
	_update_card_display(crib_cards, cards_to_show_crib)
	
	pegging_total_label.text = "Pegging Total: %d" % state.pegging_total
	var go_text := ""
	if state.player.has_said_go:
		go_text += " [Player: GO]"
	if state.opponent.has_said_go:
		go_text += " [Bot: GO]"
	pegging_total_label.text += go_text
	_update_card_display(pegging_pile_cards, state.pegging_pile)

	match state.current_phase:
		MatchState.PHASE_DISCARD:
			info_label.text = "Discard button will throw your first 2 cards into the crib."
		MatchState.PHASE_PEGGING:
			info_label.text = "Play First Card plays the first legal card from your hand."
		MatchState.PHASE_COUNT_PONE:
			var non_dealer_name := state.player.name if not state.player.is_dealer else state.opponent.name
			info_label.text = "Counting %s's hand (Non-Dealer). Click 'Next' to score." % non_dealer_name
		MatchState.PHASE_COUNT_DEALER:
			var dealer_name := state.player.name if state.player.is_dealer else state.opponent.name
			info_label.text = "Counting %s's hand (Dealer). Click 'Next' to score." % dealer_name
		MatchState.PHASE_COUNT_CRIB:
			var dealer_name := state.player.name if state.player.is_dealer else state.opponent.name
			info_label.text = "Counting %s's Crib. Click 'Next' to score." % dealer_name
		MatchState.PHASE_ROUND_OVER:
			info_label.text = "Round over. Click 'Next Round' to deal again. Total Score - Player: %d | Bot: %d." % [state.player.score, state.opponent.score]
		MatchState.PHASE_MATCH_OVER:
			info_label.text = "Winner: %s" % state.winner
		_:
			info_label.text = ""

	discard_button.disabled = state.current_phase != MatchState.PHASE_DISCARD
	
	var is_scoring_phase := state.current_phase in [MatchState.PHASE_COUNT_PONE, MatchState.PHASE_COUNT_DEALER, MatchState.PHASE_COUNT_CRIB, MatchState.PHASE_ROUND_OVER]
	
	play_first_button.disabled = not (state.current_phase == MatchState.PHASE_PEGGING and state.current_turn == "player") and not is_scoring_phase
	
	if is_scoring_phase:
		if state.current_phase == MatchState.PHASE_ROUND_OVER:
			play_first_button.text = "Next Round"
		else:
			play_first_button.text = "Next"
	elif state.current_phase == MatchState.PHASE_PEGGING and state.current_turn == "player":
		var legal_cards := LegalMoves.get_legal_pegging_cards(state.player.hand, state.pegging_total)
		if legal_cards.is_empty() and not state.player.hand.is_empty():
			play_first_button.text = "Say Go"
		else:
			play_first_button.text = "Play First Card"
	else:
		play_first_button.text = "Play First Card"
	bot_turn_button.disabled = not (state.current_phase == MatchState.PHASE_PEGGING and state.current_turn == "opponent")

func _on_discard_pressed() -> void:
	if state.player.hand.size() < 2:
		return
	selected_discards = [state.player.hand[0], state.player.hand[1]]
	flow.player_discard_to_crib(state, selected_discards)
	_refresh_ui()

func _on_play_first_pressed() -> void:
	if state.current_phase in [MatchState.PHASE_COUNT_PONE, MatchState.PHASE_COUNT_DEALER, MatchState.PHASE_COUNT_CRIB, MatchState.PHASE_ROUND_OVER]:
		flow.advance_scoring(state)
		_refresh_ui()
		return

	var legal_cards := LegalMoves.get_legal_pegging_cards(state.player.hand, state.pegging_total)
	if legal_cards.is_empty():
		if state.player.hand.is_empty():
			info_label.text = "No cards left in hand."
			return
		
		flow.pass_turn(state, "player")
		_refresh_ui()
		return
	
	flow.play_card(state, "player", legal_cards[0])
	_refresh_ui()

func _on_bot_turn_pressed() -> void:
	flow.perform_bot_turn(state)
	_refresh_ui()

func _on_menu_pressed() -> void:
	SceneRouter.go_to_main_menu(get_tree())

func _update_card_display(container: Node, cards: Array) -> void:
	# Clear existing cards
	for child in container.get_children():
		child.queue_free()
	
	for card in cards:
		if card == null: continue
		var card_view := PlayingCardScene.instantiate() as PlayingCard
		card_view.card = card
		container.add_child(card_view)

func _cards_to_text(cards: Array[Card]) -> String:
	if cards.is_empty():
		return "None"

	var parts: Array[String] = []
	for card in cards:
		parts.append(card.get_display_name())
	return ", ".join(parts)
