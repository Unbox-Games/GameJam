#version 450 core

layout(location = 0) in vec3 a_WorldPosition;
layout(location = 1) in vec3 a_Colour;

uniform mat4 u_View;
uniform mat4 u_Projection;

out vec3 _Colour;

void main()
{
	gl_Position = u_Projection * u_View * vec4(a_WorldPosition, 1.0);
	
	_Colour = a_Colour;
}
