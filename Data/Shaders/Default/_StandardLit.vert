#version 420 core

/*
	Note: Variable Naming Conventions.
	
	 - a_Variable = Attribute Type Variable.
	 - u_Variable = Uniform Type Variable.
	 - o_Variable = Out Type Variable.
	 - _Variable = Out - In Type Variable.
	 - Variable = Local Scope Type Variable.
*/

layout(location = 0) in vec3 a_WorldPosition;
layout(location = 1) in vec3 a_WorldNormal;
layout(location = 2) in vec3 a_WorldBitangent;
layout(location = 3) in vec3 a_WorldTangent;
layout(location = 4) in vec2 a_UVsAlbedo;
layout(location = 5) in vec2 a_UVsSpecular;
layout(location = 6) in vec2 a_UVsNormal;
layout(location = 7) in vec2 a_UVsMetalic;
layout(location = 8) in vec2 a_UVsRoughness;
layout(location = 9) in vec2 a_UVsEmission;
layout(location = 10) in vec4 a_Tint;

uniform mat4 u_View;
uniform mat4 u_Projection;

out vec2 _UVsAlbedo;
out vec2 _UVsSpecular;
out vec2 _UVsNormal;
out vec2 _UVsMetalic;
out vec2 _UVsRoughness;
out vec2 _UVsEmission;

out vec4 _Tint;

void main()
{
	gl_Position =  u_Projection * u_View * vec4(a_WorldPosition, 1.0);
	
	_UVsAlbedo = a_UVsAlbedo;
	_UVsSpecular = a_UVsSpecular;
	_UVsNormal = a_UVsNormal;
	_UVsMetalic = a_UVsMetalic;
	_UVsRoughness = a_UVsRoughness;
	_UVsEmission = a_UVsEmission;

	_Tint = a_Tint;
}
