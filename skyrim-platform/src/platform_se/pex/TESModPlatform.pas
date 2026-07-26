.info
  .source "TESModPlatform.psc"
  .modifyTime 1783818009
  .compileTime 1783818023
  .user "Anton"
  .computer "DESKTOP-VEILGIQ"
.endInfo
.userFlagsRef
  .flag conditional 1
  .flag hidden 0
.endUserFlagsRef
.objectTable
  .object TESModPlatform 
    .userFlags 0
    .docString ""
    .autoState 
    .variableTable
    .endVariableTable
    .propertyTable
    .endPropertyTable
    .stateTable
      .state
        .function GetState
          .userFlags 0
          .docString "Function that returns the current state"
          .return String
          .paramTable
          .endParamTable
          .localTable
          .endLocalTable
          .code
            RETURN ::state
          .endCode
        .endFunction
        .function GotoState
          .userFlags 0
          .docString "Function that switches this object to the specified state"
          .return None
          .paramTable
            .param newState String
          .endParamTable
          .localTable
            .local ::NoneVar None
          .endLocalTable
          .code
            CALLMETHOD onEndState self ::NoneVar
            ASSIGN ::state newState
            CALLMETHOD onBeginState self ::NoneVar
          .endCode
        .endFunction
        .function MoveRefrToPosition native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param refr ObjectReference
            .param cell cell
            .param world WorldSpace
            .param posX Float
            .param posY Float
            .param posZ Float
            .param rotX Float
            .param rotY Float
            .param rotZ Float
          .endParamTable
        .endFunction
        .function Add native static
          .userFlags 0
          .docString ""
          .return Int
          .paramTable
            .param a1 Int
            .param a2 Int
            .param a3 Int
            .param a4 Int
            .param a5 Int
            .param a6 Int
            .param a7 Int
            .param a8 Int
            .param a9 Int
            .param a10 Int
            .param a11 Int
            .param a12 Int
          .endParamTable
        .endFunction
        .function SetWeaponDrawnMode native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param actor Actor
            .param mode Int
          .endParamTable
        .endFunction
        .function MountActor native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param rider Actor
            .param mount Actor
          .endParamTable
        .endFunction
        .function InitiateMountPackage native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param rider Actor
            .param mount Actor
          .endParamTable
        .endFunction
        .function ForcePositionSynced native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param actor Actor
            .param x Float
            .param y Float
            .param z Float
          .endParamTable
        .endFunction
        .function SetMountCollisionGuard native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param enabled Bool
          .endParamTable
        .endFunction
        .function SetPhysicsBlockEnabled native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param enabled Bool
          .endParamTable
        .endFunction
        .function AddPhysicsBlockedActor native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param horse Actor
          .endParamTable
        .endFunction
        .function RemovePhysicsBlockedActor native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param horse Actor
          .endParamTable
        .endFunction
        .function GetMount native static
          .userFlags 0
          .docString ""
          .return Actor
          .paramTable
            .param rider Actor
          .endParamTable
        .endFunction
        .function GetNthVtableElement native static
          .userFlags 0
          .docString ""
          .return Int
          .paramTable
            .param pointer Form
            .param pointerOffset Int
            .param elementIndex Int
          .endParamTable
        .endFunction
        .function IsPlayerRunningEnabled native static
          .userFlags 0
          .docString ""
          .return Bool
          .paramTable
          .endParamTable
        .endFunction
        .function GetSkinColor native static
          .userFlags 0
          .docString ""
          .return ColorForm
          .paramTable
            .param base ActorBase
          .endParamTable
        .endFunction
        .function CreateNpc native static
          .userFlags 0
          .docString ""
          .return ActorBase
          .paramTable
          .endParamTable
        .endFunction
        .function EvaluateLeveledNpc native static
          .userFlags 0
          .docString ""
          .return ActorBase
          .paramTable
            .param commaSeparatedListOfIds String
          .endParamTable
        .endFunction
        .function SetNpcSex native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param npc ActorBase
            .param sex Int
          .endParamTable
        .endFunction
        .function SetNpcRace native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param npc ActorBase
            .param race Race
          .endParamTable
        .endFunction
        .function SetNpcSkinColor native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param npc ActorBase
            .param skinColor Int
          .endParamTable
        .endFunction
        .function SetNpcHairColor native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param npc ActorBase
            .param hairColor Int
          .endParamTable
        .endFunction
        .function ResizeHeadpartsArray native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param npc ActorBase
            .param newSize Int
          .endParamTable
        .endFunction
        .function ResizeTintsArray native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param newSize Int
          .endParamTable
        .endFunction
        .function SetFormIdUnsafe native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param form Form
            .param newId Int
          .endParamTable
        .endFunction
        .function ClearTintMasks native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param targetActor Actor
          .endParamTable
        .endFunction
        .function PushTintMask native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param targetActor Actor
            .param type Int
            .param argb Int
            .param texturePath String
          .endParamTable
        .endFunction
        .function PushWornState native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param worn Bool
            .param wornLeft Bool
          .endParamTable
        .endFunction
        .function AddItemEx native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param containerRefr ObjectReference
            .param item Form
            .param countDelta Int
            .param health Float
            .param enchantment Enchantment
            .param maxCharge Int
            .param removeEnchantmentOnUnequip Bool
            .param chargePercent Float
            .param textDisplayData String
            .param soul Int
            .param poison Potion
            .param poisonCount Int
          .endParamTable
        .endFunction
        .function UpdateEquipment native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param actor Actor
            .param item Form
            .param leftHand Bool
          .endParamTable
        .endFunction
        .function ResetContainer native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param container Form
          .endParamTable
        .endFunction
        .function BlockPapyrusEvents native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param block Bool
          .endParamTable
        .endFunction
        .function CreateReferenceAtLocation native static
          .userFlags 0
          .docString ""
          .return ObjectReference
          .paramTable
            .param baseForm Form
            .param cell Cell
            .param world WorldSpace
            .param posX Float
            .param posY Float
            .param posZ Float
            .param rotX Float
            .param rotY Float
            .param rotZ Float
            .param persist Bool
          .endParamTable
        .endFunction
        .function CloseMenu native static
          .userFlags 0
          .docString ""
          .return NONE
          .paramTable
            .param name string
          .endParamTable
        .endFunction
        .function onBeginState
          .userFlags 0
          .docString "Event received when this state is switched to"
          .return None
          .paramTable
          .endParamTable
          .localTable
          .endLocalTable
          .code
          .endCode
        .endFunction
        .function onEndState
          .userFlags 0
          .docString "Event received when this state is switched away from"
          .return None
          .paramTable
          .endParamTable
          .localTable
          .endLocalTable
          .code
          .endCode
        .endFunction
      .endState
    .endStateTable
  .endObject
.endObjectTable