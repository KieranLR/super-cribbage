extends PanelContainer
class_name PlayingCard

@onready var rank_label: Label = %RankLabel
@onready var suit_label: Label = %SuitLabel

var card: Card:
	set(value):
		card = value
		if is_node_ready():
			_update_display()

func _ready() -> void:
	if card:
		_update_display()

func _update_display() -> void:
	if not card or not is_node_ready():
		return
	rank_label.text = _get_rank_short_name(card.rank)
	suit_label.text = _get_suit_symbol(card.suit)
	
	var color := Color.BLACK
	if card.suit == "Hearts" or card.suit == "Diamonds":
		color = Color.RED
	
	rank_label.add_theme_color_override("font_color", color)
	suit_label.add_theme_color_override("font_color", color)

func _get_rank_short_name(rank: int) -> String:
	match rank:
		1: return "A"
		11: return "J"
		12: return "Q"
		13: return "K"
		_: return str(rank)

func _get_suit_symbol(suit: String) -> String:
	match suit:
		"Hearts": return "♥"
		"Diamonds": return "♦"
		"Clubs": return "♣"
		"Spades": return "♠"
		_: return suit
