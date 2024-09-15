#version 450 core

/*
	Note: Variable Naming Conventions.
	
	 - a_Variable = Attribute Type Variable.
	 - u_Variable = Uniform Type Variable.
	 - o_Variable = Out Type Variable.
	 - _Variable = Out - In Type Variable.
	 - Variable = Local Scope Type Variable.
*/

layout(location = 0) out vec4 o_FragColour;
//layout(location = 1) out vec4 o_EmissionColour;
layout(location = 3) out vec4 o_DepthColour;

uniform sampler2D u_TextureAlbedo;

in vec2 _UVsAlbedo;

float near = 0.1; 
float far  = 100.0; 

float Depth(float depth)
{
	float z = depth * 2.0 - 1.0;
    return (2.0 * near * far) / (far + near - z * (far - near));	
}

void main()
{
	vec4 EndResult = texture(u_TextureAlbedo, _UVsAlbedo);
	if(EndResult.a > 0.0) 	o_FragColour = vec4(1.0, 0.0, 1.0, 1.0);
	else 					discard;

	float depth = Depth(gl_FragCoord.z) / far;
	o_DepthColour = vec4(vec3(depth), 1.0);
}


