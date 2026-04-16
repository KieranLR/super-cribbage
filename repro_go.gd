extends SceneTree

func _init():
	var flow = MatchFlow.new()
	var state = flow.start_new_match()
	
	# Manually setup hands for a Go scenario
	# Player: 10, 10
	# Opponent: 10, 10
	# Total: 0
	state.player.hand = [Card.new("Hearts", 10), Card.new("Clubs", 10)]
	state.opponent.hand = [Card.new("Diamonds", 10), Card.new("Spades", 10)]
	state.pegging_total = 0
	state.current_phase = MatchState.PHASE_PEGGING
	state.current_turn = "player"
	
	print("[DEBUG_LOG] Starting test scenario")
	print("[DEBUG_LOG] Player hand: ", state.player.hand.size())
	print("[DEBUG_LOG] Opponent hand: ", state.opponent.hand.size())
	
	# 1. Player plays 10 (Total 10)
	flow.play_card(state, "player", state.player.hand[0])
	print("[DEBUG_LOG] Player played 10. Total: ", state.pegging_total, " Turn: ", state.current_turn)
	
	# 2. Opponent plays 10 (Total 20)
	flow.play_card(state, "opponent", state.opponent.hand[0])
	print("[DEBUG_LOG] Opponent played 10. Total: ", state.pegging_total, " Turn: ", state.current_turn)

	# 3. Player plays 10 (Total 30)
	flow.play_card(state, "player", state.player.hand[0])
	print("[DEBUG_LOG] Player played 10. Total: ", state.pegging_total, " Turn: ", state.current_turn)

	# 4. Opponent has 10, but 30+10 > 31. Opponent must say Go.
	print("[DEBUG_LOG] Opponent hand: ", state.opponent.hand[0].get_pegging_value())
	var legal = LegalMoves.get_legal_pegging_cards(state.opponent.hand, state.pegging_total)
	print("[DEBUG_LOG] Opponent legal cards: ", legal.size())
	
	if legal.is_empty():
		flow.pass_turn(state, "opponent")
		print("[DEBUG_LOG] Opponent said Go. Total: ", state.pegging_total, " Turn: ", state.current_turn)
		print("[DEBUG_LOG] Opponent has_said_go: ", state.opponent.has_said_go)

	# 5. Player has no cards left. Player must also say Go.
	legal = LegalMoves.get_legal_pegging_cards(state.player.hand, state.pegging_total)
	print("[DEBUG_LOG] Player legal cards: ", legal.size())
	if legal.is_empty():
		var old_player_score = state.player.score
		flow.pass_turn(state, "player")
		print("[DEBUG_LOG] Player said Go. Total: ", state.pegging_total, " Turn: ", state.current_turn)
		print("[DEBUG_LOG] Player score increased? ", state.player.score > old_player_score)
		print("[DEBUG_LOG] Player score: ", state.player.score)

	# Check if reset happened
	if state.pegging_total == 0:
		print("[DEBUG_LOG] Pegging total reset successfully.")
	else:
		print("[DEBUG_LOG] Pegging total NOT reset. Current: ", state.pegging_total)

	quit()
