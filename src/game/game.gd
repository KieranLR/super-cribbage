extends Node2D

func _ready() -> void:
	print("Game Scene Loaded")

func _on_back_button_pressed() -> void:
	get_tree().change_scene_to_file("res://scenes/ui/Menu.tscn")
