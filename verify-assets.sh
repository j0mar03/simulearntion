#!/bin/bash

# ============================================================================
# Asset Verification Script
# Checks that all elements from "Compilations of gokgok simulator 2000" are
# properly integrated into the web-based multiplayer version
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        SimuLearntion - Asset Verification         ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

check_file() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $2 - MISSING: $1"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

check_directory() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -d "$1" ]; then
        COUNT=$(find "$1" -type f | wc -l)
        echo -e "${GREEN}✓${NC} $2 ($COUNT files)"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $2 - MISSING: $1"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. BACKGROUND IMAGES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "client/assets/images/Lobby.png" "Lobby Background"
check_file "client/assets/images/Library.png" "Library Background"
check_file "client/assets/images/Game 2 UI Layout.png" "Quiz Background"
check_file "client/assets/images/Avatar Customization.png" "Customization Background"
check_file "client/assets/images/achievementUI.png" "Achievement Background"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. UI BUTTONS & ELEMENTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "client/assets/images/back button.png" "Back Button"
check_file "client/assets/images/exit button.png" "Exit Button"
check_file "client/assets/ui/lobby/avatar button.png" "Avatar Button"
check_file "client/assets/ui/lobby/profile ui.png" "Profile UI"
check_file "client/assets/ui/library ui/study button.png" "Study Button"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. AVATAR CUSTOMIZATION BUTTONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "client/assets/ui/avatar ui/uniform1 select.png" "Uniform 1 Button"
check_file "client/assets/ui/avatar ui/uniform2 select.png" "Uniform 2 Button"
check_file "client/assets/ui/avatar ui/cape select.png" "Cape Button"
check_file "client/assets/ui/avatar ui/scarf select.png" "Scarf Button"
check_file "client/assets/ui/avatar ui/cat button.png" "Cat Button"
check_file "client/assets/ui/avatar ui/flower select.png" "Flower Button"
check_file "client/assets/ui/avatar ui/halo select.png" "Halo Button"
check_file "client/assets/ui/avatar ui/sunglasses button.png" "Sunglasses Button"
check_file "client/assets/ui/avatar ui/remove accessory button.png" "Remove Accessory Button"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. AVATAR STATIC SPRITES (Preview)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "client/assets/avatar/base/base.png" "Base Character"
check_file "client/assets/avatar/body/uniform 1.png" "Uniform 1 Sprite"
check_file "client/assets/avatar/body/uniform 2.png" "Uniform 2 Sprite"
check_file "client/assets/avatar/body/cape.png" "Cape Sprite"
check_file "client/assets/avatar/body/scarf.png" "Scarf Sprite"
check_file "client/assets/avatar/head/cat.png" "Cat Head Sprite"
check_file "client/assets/avatar/head/flower.png" "Flower Head Sprite"
check_file "client/assets/avatar/head/halo.png" "Halo Head Sprite"
check_file "client/assets/avatar/head/sunglasses.png" "Sunglasses Head Sprite"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. ANIMATED SPRITES (GIF Animations)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "client/assets/animations/base.gif" "Base Animation"
check_file "client/assets/animations/cat.gif" "Cat Animation"
check_file "client/assets/animations/flower.gif" "Flower Animation"
check_file "client/assets/animations/uniform 1.gif" "Uniform 1 Animation"
check_file "client/assets/animations/uniform 2.gif" "Uniform 2 Animation"
check_file "client/assets/animations/cape.gif" "Cape Animation"
check_file "client/assets/animations/scarf.gif" "Scarf Animation"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. COMBINED ANIMATIONS (Body + Head)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "client/assets/animations/uniform 1 with cat.gif" "Uniform 1 + Cat"
check_file "client/assets/animations/uniform 1 with flower.gif" "Uniform 1 + Flower"
check_file "client/assets/animations/uniform 2 with cat.gif" "Uniform 2 + Cat"
check_file "client/assets/animations/cape with cat.gif" "Cape + Cat"
check_file "client/assets/animations/scarf with flower.gif" "Scarf + Flower"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. DIRECTORY STRUCTURE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_directory "client/assets/images" "Images Directory"
check_directory "client/assets/animations" "Animations Directory"
check_directory "client/assets/avatar" "Avatar Directory"
check_directory "client/assets/ui" "UI Directory"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8. GAME CODE FILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "client/js/scenes/BootScene.js" "BootScene (Asset Loader)"
check_file "client/js/scenes/LobbyScene.js" "LobbyScene"
check_file "client/js/scenes/LibraryScene.js" "LibraryScene"
check_file "client/js/scenes/QuizScene.js" "QuizScene"
check_file "client/js/scenes/CustomScene.js" "CustomScene"
check_file "client/js/scenes/AchieveScene.js" "AchieveScene"
check_file "client/js/entities/Player.js" "Player Entity"
check_file "client/js/entities/OtherPlayer.js" "OtherPlayer Entity"
check_file "client/js/utils/GIFPlayer.js" "GIF Player Utility"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "9. SERVER FILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "server/server.js" "Main Server"
check_file "server/socket-handler.js" "Socket.IO Handler"
check_file "shared/constants.js" "Shared Constants (Quiz Questions)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "10. DEPLOYMENT FILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "Dockerfile" "Dockerfile"
check_file "docker-compose.yml" "Docker Compose Config"
check_file "package.json" "Package Configuration"
check_file "prisma/schema.prisma" "Database Schema"
check_file ".env.docker" "Environment Template"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "                        SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Total Checks:  $TOTAL_CHECKS"
echo -e "Passed:        ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed:        ${RED}$FAILED_CHECKS${NC}"
echo ""

# Asset counts
if [ -d "client/assets" ]; then
    TOTAL_PNG=$(find client/assets -name "*.png" 2>/dev/null | wc -l)
    TOTAL_GIF=$(find client/assets -name "*.gif" 2>/dev/null | wc -l)
    TOTAL_ASSETS=$((TOTAL_PNG + TOTAL_GIF))
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "                    ASSET STATISTICS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "PNG Images:    $TOTAL_PNG"
    echo "GIF Animations: $TOTAL_GIF"
    echo "Total Assets:  $TOTAL_ASSETS"
    echo ""
fi

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║       ✓ ALL CHECKS PASSED - READY FOR DEPLOYMENT!         ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "All elements from 'Compilations of gokgok simulator 2000' are"
    echo "properly integrated and ready to use!"
    echo ""
    echo "To deploy, run: ./deploy.sh"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                            ║${NC}"
    echo -e "${RED}║            ✗ SOME CHECKS FAILED!                           ║${NC}"
    echo -e "${RED}║                                                            ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Please ensure all assets from 'Compilations of gokgok simulator 2000'"
    echo "are properly copied to the client/assets directory."
    echo ""
    echo "Expected structure:"
    echo "  client/assets/"
    echo "    ├── images/       (backgrounds, UI layouts)"
    echo "    ├── animations/   (character GIF animations)"
    echo "    ├── avatar/       (static avatar sprites)"
    echo "    └── ui/           (buttons, icons)"
    exit 1
fi
