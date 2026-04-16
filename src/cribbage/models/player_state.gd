extends RefCounted
class_name PlayerState

var name: String
var hand: Array[Card] = []
var played_cards: Array[Card] = []
var score: int = 0
var is_dealer: bool = false
var has_said_go: bool = false

func _init(p_name: String) -> void:
	name = p_name

func reset_for_round() -> void:
	hand.clear()
	played_cards.clear()
	has_said_go = false

func remove_card_from_hand(card: Card) -> bool:
	var index := hand.find(card)
	if index == -1:
		return false
	hand.remove_at(index)
	return true
