extends RefCounted
class_name Deck

const SUITS := ["Hearts", "Diamonds", "Clubs", "Spades"]

var cards: Array[Card] = []

func _init() -> void:
	reset()

func reset() -> void:
	cards.clear()
	for suit in SUITS:
		for rank in range(1, 14):
			cards.append(Card.new(suit, rank))

func shuffle_deck() -> void:
	cards.shuffle()

func draw() -> Card:
	if cards.is_empty():
		return null
	return cards.pop_back()
