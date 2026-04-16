extends RefCounted
class_name LegalMoves

static func get_legal_pegging_cards(hand: Array[Card], pegging_total: int) -> Array[Card]:
	var legal: Array[Card] = []
	for card in hand:
		if pegging_total + card.get_pegging_value() <= 31:
			legal.append(card)
	return legal

static func can_discard_to_crib(selected_cards: Array[Card]) -> bool:
	return selected_cards.size() == 2
