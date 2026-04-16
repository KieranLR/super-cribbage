extends RefCounted
class_name Scoring

static func score_pegging_play(pegging_total: int) -> int:
	var points := 0
	if pegging_total == 15:
		points += 2
	if pegging_total == 31:
		points += 2
	return points

static func score_hand(_hand: Array[Card], _starter: Card, _is_crib: bool = false) -> int:
	# Bare-bones placeholder.
	# Replace later with full fifteens / pairs / runs / flush / nobs scoring.
	return 0
