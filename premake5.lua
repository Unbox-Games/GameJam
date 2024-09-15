if _OPTIONS['engine_dir'] then
    local pathToSolutionItems = path.join(_OPTIONS['engine_dir'], "Third-Party/premake/premake_optimisation/solution_items.lua")
    include (pathToSolutionItems)
else
    include "Third-Party/premake/premake_optimisation/solution_items.lua"
end

workspace "CSharpAssembly"
	architecture "x86_64"
	startproject "CSharpAssembly"

	configurations
	{
		"Debug",
		"Release",
		"Distribution"
	}

	flags
	{
		"MultiProcessorCompile"
	}

project "CSharpAssembly"
    kind "SharedLib"
    language "C#"
    dotnetframework "4.7.2"

    if _OPTIONS['engine_dir'] then
        local engineDir = _OPTIONS['engine_dir']
        local targetPath = engineDir .. "\\"
        local objPath = path.join(_OPTIONS['engine_dir'], "/Engine_Data/Binaries-Intermediate/%{cfg.buildcfg}/CSharpAssembly/")
        
        printf(targetPath)

        targetdir (targetPath)
        objdir (objPath)
    else
        targetdir ("./")
        objdir ("./Engine_Data/Binaries-Intermediate/%{cfg.buildcfg}/CSharpAssembly")
    end

    files
    {
        "Data/Scripts/**.cs",
    }

    links
    {
        "BellyRub-ScriptCore"
    }

    filter "configurations:Debug"
        optimize "Off"
        symbols "Default"

    filter "configurations:Release"
        optimize "On"
        symbols "Default"

    filter "configurations:Distribution"
        optimize "Full"
        symbols "Off"

group "BellyRub"
    if _OPTIONS['engine_dir'] then
        local pathToScriptCore = path.join(_OPTIONS['engine_dir'], "BellyRub-ScriptCore")
        include (pathToScriptCore)
    else
        include "BellyRub-ScriptCore"
    end
    
group ""