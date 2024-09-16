using System;
using BellyRub;

namespace CSharpAssembly
{
	public class PlayerController : ScriptController
	{
		public float m_VelocityDeadzone = 0.05f;
		private SpriteComponent m_SpriteComponent = null;
		private SpriteAnimatorComponent m_SpriteAnimatorComponent = null;
		private Rigidbody2DComponent m_Rigidbody2DComponent = null;

		void Start()
		{
			Entity visualChild = entity.GetChild(0);
			m_SpriteComponent = visualChild.GetComponent<SpriteComponent>();
			m_SpriteAnimatorComponent = visualChild.GetComponent<SpriteAnimatorComponent>();
			m_Rigidbody2DComponent = GetComponent<Rigidbody2DComponent>();
		}

		void Update()
		{
			Vector2 velocity = m_Rigidbody2DComponent.velocity;

			if (velocity.x >= m_VelocityDeadzone || velocity.x <= -m_VelocityDeadzone)
			{
				m_SpriteComponent.xFlip = velocity.x < 0.0f;
				m_SpriteAnimatorComponent.SetCurrentAnimation(1);
			}
			else
			{
				m_SpriteAnimatorComponent.SetCurrentAnimation(0);
			}
		}
	}
}