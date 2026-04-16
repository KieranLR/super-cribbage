extends RefCounted
class_name Scoring

static func score_pegging_play(pegging_total: int) -> int:
	var points := 0
	if pegging_total == 15:
		points += 2
	if pegging_total == 31:
		points += 2
	return points

static func score_hand(hand: Array[Card], starter: Card, is_crib: bool = false) -> int:
	var full_hand: Array[Card] = hand.duplicate()
	if starter:
		full_hand.append(starter)
	
	var points := 0
	
	# 1. Fifteens
	points += _score_fifteens(full_hand)
	
	# 2. Pairs
	points += _score_pairs(full_hand)
	
	# 3. Runs
	points += _score_runs(full_hand)
	
	# 4. Flush
	points += _score_flush(hand, starter, is_crib)
	
	# 5. Nobs (His Nob)
	points += _score_nobs(hand, starter)
	
	return points

static func _score_fifteens(cards: Array[Card]) -> int:
	var points := 0
	var n := cards.size()
	# Check all combinations (2^n)
	for i in range(1, 1 << n):
		var total := 0
		for j in range(n):
			if (i >> j) & 1:
				total += cards[j].get_pegging_value()
		if total == 15:
			points += 2
	return points

static func _score_pairs(cards: Array[Card]) -> int:
	var points := 0
	for i in range(cards.size()):
		for j in range(i + 1, cards.size()):
			if cards[i].rank == cards[j].rank:
				points += 2
	return points

static func _score_runs(cards: Array[Card]) -> int:
	var ranks: Array[int] = []
	for card in cards:
		ranks.append(card.rank)
	ranks.sort()
	
	var points := 0
	# Find all unique combinations of cards that form a run
	# In Cribbage, a run is 3 or more consecutive ranks.
	# We need to count how many times each run is formed.
	# Example: 4, 5, 5, 6 is two runs of 3.
	
	# Simpler approach: find the longest run length and then handle duplicates
	# Actually, the standard way is to count combinations.
	# But for a hand of 5, we can just find all sub-sequences that are runs.
	# Let's use a frequency map.
	var freq := {}
	for r in ranks:
		freq[r] = freq.get(r, 0) + 1
	
	var unique_ranks = freq.keys()
	unique_ranks.sort()
	
	var longest_run: Array[int] = []
	var current_run: Array[int] = []
	
	var i = 0
	while i < unique_ranks.size():
		if current_run.is_empty() or unique_ranks[i] == current_run[-1] + 1:
			current_run.append(unique_ranks[i])
		else:
			if current_run.size() >= 3:
				# Score this run
				var multiplier := 1
				for r in current_run:
					multiplier *= freq[r]
				points += current_run.size() * multiplier
			current_run = [unique_ranks[i]]
		i += 1
	
	if current_run.size() >= 3:
		var multiplier := 1
		for r in current_run:
			multiplier *= freq[r]
		points += current_run.size() * multiplier
		
	return points

static func _score_flush(hand: Array[Card], starter: Card, is_crib: bool) -> int:
	if hand.is_empty(): return 0
	
	var first_suit = hand[0].suit
	var hand_flush = true
	for i in range(1, hand.size()):
		if hand[i].suit != first_suit:
			hand_flush = false
			break
	
	if hand_flush:
		if starter and starter.suit == first_suit:
			return hand.size() + 1
		elif not is_crib:
			return hand.size()
	return 0

static func _score_nobs(hand: Array[Card], starter: Card) -> int:
	if not starter: return 0
	for card in hand:
		if card.rank == 11 and card.suit == starter.suit: # 11 is Jack
			return 1
	return 0
