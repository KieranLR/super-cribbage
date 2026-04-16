extends Control

func _ready() -> void:
	var start_button: Button = $CenterContainer/VBoxContainer/StartButton
	start_button.pressed.connect(_on_start_pressed)

func _on_start_pressed() -> void:
	SceneRouter.go_to_game(get_tree())
