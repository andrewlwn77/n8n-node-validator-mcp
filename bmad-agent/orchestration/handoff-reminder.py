#!/usr/bin/env python3
"""
Simple handoff reminder for BMAD persona transitions
"""

import sys

def main():
    """Echo handoff reminder"""    

    # Write to stderr so it gets fed back to Claude
    sys.stderr.write("\n🔄 BMAD HANDOFF REMINDER:\n")
    sys.stderr.write("If you're transitioning to another persona, please:\n")
    sys.stderr.write("1. Return to [Orchestrator] first\n")
    sys.stderr.write("2. Include a note about which persona should handle next\n")
    sys.stderr.write("3. Mention any completed deliverables for context\n")
    sys.stderr.write("4. The orchestrator will validate and forward appropriately\n")
    sys.stderr.write("5. CRITICAL: Keep all status files updated throughout development\n")
    sys.stderr.write("6. CRITICAL: Follow defined epics and stories when developing the project\n\n")
    
    # Exit code 2 ensures stderr is fed back to Claude
    sys.exit(2)

if __name__ == "__main__":
    main()