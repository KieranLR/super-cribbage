extends Resource
class_name Card

@export_enum("Hearts", "Diamonds", "Clubs", "Spades") var suit: String
@export_range(1, 13) var rank: int

func _init(p_suit: String = "Hearts", p_rank: int = 1) -> void:
	suit = p_suit
	rank = p_rank

func get_display_name() -> String:
	return "%s of %s" % [_rank_name(rank), suit]

func get_pegging_value() -> int:
	return min(rank, 10)

func _rank_name(value: int) -> String:
	match value:
		1:
			return "Ace"
		11:
			return "Jack"
		12:
			return "Queen"
		13:
			return "King"
		_:
			return str(value)
