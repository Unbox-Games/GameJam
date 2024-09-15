#version 420 core

/*
	Note: Variable Naming Conventions.
	
	 - a_Variable = Attribute Type Variable.
	 - u_Variable = Uniform Type Variable.
	 - o_Variable = Out Type Variable.
	 - _Variable = Out - In Type Variable.
	 - Variable = Local Scope Type Variable.
*/

layout(location = 0) out vec4 o_FragColour;
layout(location = 1) out vec4 o_EmissionColour;

uniform sampler2D u_TextureAlbedo;
uniform sampler2D u_TextureEmission;

in vec2 _UVsAlbedo;	
in vec2 _UVsEmission;

in vec4 _Tint;

void main()
{
	o_EmissionColour = texture(u_TextureEmission, _UVsEmission) * _Tint;
	
	vec4 EndResult = texture(u_TextureAlbedo, _UVsAlbedo) * _Tint;
	if(EndResult.a > 0.0) 	o_FragColour = EndResult;
	else 					discard;

	//o_FragColour = vec4(1, 1, 0, 1);
}
