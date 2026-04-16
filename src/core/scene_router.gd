extends Node
class_name SceneRouter

const MAIN_MENU_SCENE := "res://scenes/menus/MainMenu.tscn"
const GAME_SCENE := "res://scenes/game/Game.tscn"

static func go_to_main_menu(tree: SceneTree) -> void:
	tree.change_scene_to_file(MAIN_MENU_SCENE)

static func go_to_game(tree: SceneTree) -> void:
	tree.change_scene_to_file(GAME_SCENE)
