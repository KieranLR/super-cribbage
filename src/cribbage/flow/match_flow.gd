extends RefCounted
class_name MatchFlow

func start_new_match() -> MatchState:
	var state := MatchState.new()
	state.player.is_dealer = false
	state.opponent.is_dealer = true
	start_new_round(state)
	return state

func start_new_round(state: MatchState) -> void:
	state.reset_round()
	_deal_hands(state)
	state.current_phase = MatchState.PHASE_DISCARD

func player_discard_to_crib(state: MatchState, selected_cards: Array[Card]) -> bool:
	if not LegalMoves.can_discard_to_crib(selected_cards):
		return false

	for card in selected_cards:
		if state.player.remove_card_from_hand(card):
			state.crib.append(card)

	while state.opponent.hand.size() > 4:
		var bot_card: Card = state.opponent.hand.pop_back()
		state.crib.append(bot_card)

	state.current_phase = MatchState.PHASE_STARTER
	state.starter_card = state.deck.draw()
	state.current_phase = MatchState.PHASE_PEGGING
	state.current_turn = "player"
	return true

func play_card(state: MatchState, side: String, card: Card) -> bool:
	if state.current_phase != MatchState.PHASE_PEGGING:
		return false
	if state.current_turn != side:
		return false
	if state.pegging_total + card.get_pegging_value() > 31:
		return false

	var actor := state.player if side == "player" else state.opponent
	var opponent := state.opponent if side == "player" else state.player
	
	if not actor.remove_card_from_hand(card):
		return false

	actor.played_cards.append(card)
	state.pegging_pile.append(card)
	state.pegging_total += card.get_pegging_value()
	actor.score += Scoring.score_pegging_play(state.pegging_total)

	if state.pegging_total == 31:
		_reset_pegging_sequence(state)
	
	if _is_pegging_complete(state):
		_finish_pegging_and_score_hands(state)
	else:
		var opponent_hand := state.opponent.hand if side == "player" else state.player.hand
		var can_opponent_play := not LegalMoves.get_legal_pegging_cards(opponent_hand, state.pegging_total).is_empty()
		
		if can_opponent_play:
			state.switch_turn()
		else:
			# Opponent cannot play.
			opponent.has_said_go = true
			
			# Current player gets to go again if they can.
			var actor_hand := state.player.hand if side == "player" else state.opponent.hand
			var can_actor_play := not LegalMoves.get_legal_pegging_cards(actor_hand, state.pegging_total).is_empty()
			
			if not can_actor_play:
				# Neither can play, and it wasn't 31.
				# Go for the LAST player who actually played a card.
				actor.score += 1 
				_reset_pegging_sequence(state)
				# After a reset, the NEXT person starts.
				state.switch_turn()
			else:
				# Actor can still play, so keep it their turn.
				pass

	return true

func pass_turn(state: MatchState, side: String) -> bool:
	if state.current_phase != MatchState.PHASE_PEGGING:
		return false
	if state.current_turn != side:
		return false
	
	var actor := state.player if side == "player" else state.opponent
	var legal_cards := LegalMoves.get_legal_pegging_cards(actor.hand, state.pegging_total)
	
	if not legal_cards.is_empty():
		return false # Cannot pass if you have legal moves
	
	actor.has_said_go = true
	var opponent := state.opponent if side == "player" else state.player
	
	var can_opponent_play := not LegalMoves.get_legal_pegging_cards(opponent.hand, state.pegging_total).is_empty()
	
	if not can_opponent_play:
		# Both said Go. Last player who played gets a point.
		# The last person who played is the 'opponent' of the person currently passing.
		if not state.pegging_pile.is_empty():
			# This point is for the 'Go' that ends the sequence.
			opponent.score += 1
		_reset_pegging_sequence(state)
		state.switch_turn()
	else:
		# Opponent can play. They "take the Go".
		# In Cribbage, when you pass, the other player keeps playing until they can't.
		state.switch_turn()
	
	return true

func perform_bot_turn(state: MatchState) -> void:
	if state.current_phase != MatchState.PHASE_PEGGING:
		return
	if state.current_turn != "opponent":
		return

	var legal_cards := LegalMoves.get_legal_pegging_cards(state.opponent.hand, state.pegging_total)
	if legal_cards.is_empty():
		pass_turn(state, "opponent")
		return

	play_card(state, "opponent", legal_cards[0])

func _reset_pegging_sequence(state: MatchState) -> void:
	state.pegging_total = 0
	state.player.has_said_go = false
	state.opponent.has_said_go = false
	# We don't clear pegging_pile here because it's used for scoring later? 
	# Actually, in cribbage, cards are turned over. 
	# The current implementation uses state.pegging_pile for UI and state.player.played_cards for scoring.
	# Let's keep pegging_pile for UI but maybe we should clear it or mark a break.
	# For now, let's just reset total and Go flags.

func _deal_hands(state: MatchState) -> void:
	for _i in range(6):
		state.player.hand.append(state.deck.draw())
		state.opponent.hand.append(state.deck.draw())

func _is_pegging_complete(state: MatchState) -> bool:
	return state.player.hand.is_empty() and state.opponent.hand.is_empty()

func _finish_pegging_and_score_hands(state: MatchState) -> void:
	state.current_phase = MatchState.PHASE_COUNT_HANDS
	state.player.score += Scoring.score_hand(state.player.played_cards, state.starter_card, false)
	state.opponent.score += Scoring.score_hand(state.opponent.played_cards, state.starter_card, false)

	state.current_phase = MatchState.PHASE_COUNT_CRIB
	state.opponent.score += Scoring.score_hand(state.crib, state.starter_card, true)

	if state.player.score >= 121:
		state.current_phase = MatchState.PHASE_MATCH_OVER
		state.winner = state.player.name
		return
	if state.opponent.score >= 121:
		state.current_phase = MatchState.PHASE_MATCH_OVER
		state.winner = state.opponent.name
		return

	state.current_phase = MatchState.PHASE_ROUND_OVER
