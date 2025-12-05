<?php
/**
 * Plugin Name: Repair Tracker for WooCommerce
 * Description: מערכת מעקב תיקונים משולבת עם WooCommerce
 * Version: 1.0.0
 * Author: Your Name
 * Text Domain: repair-tracker-woo
 */

if (!defined('ABSPATH')) {
    exit;
}

class Repair_Tracker_WooCommerce {
    
    private $api_url;
    private $api_key;
    
    public function __construct() {
        $this->api_url = get_option('repair_tracker_api_url', '');
        $this->api_key = get_option('repair_tracker_api_key', '');
        
        // Admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        
        // WooCommerce hooks
        add_action('woocommerce_order_status_changed', array($this, 'sync_order_status'), 10, 4);
        add_action('woocommerce_new_order', array($this, 'new_order_created'), 10, 1);
        
        // Add meta box to order page
        add_action('add_meta_boxes', array($this, 'add_order_meta_box'));
        
        // AJAX handlers
        add_action('wp_ajax_repair_tracker_send_whatsapp', array($this, 'ajax_send_whatsapp'));
        add_action('wp_ajax_repair_tracker_sync_order', array($this, 'ajax_sync_order'));
        
        // Enqueue admin scripts
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'מעקב תיקונים',
            'מעקב תיקונים',
            'manage_options',
            'repair-tracker',
            array($this, 'render_admin_page'),
            'dashicons-wrench',
            56
        );
        
        add_submenu_page(
            'repair-tracker',
            'הגדרות',
            'הגדרות',
            'manage_options',
            'repair-tracker-settings',
            array($this, 'render_settings_page')
        );
    }
    
    public function register_settings() {
        register_setting('repair_tracker_settings', 'repair_tracker_api_url');
        register_setting('repair_tracker_settings', 'repair_tracker_api_key');
    }
    
    public function render_settings_page() {
        ?>
        <div class="wrap" dir="rtl">
            <h1>הגדרות מעקב תיקונים</h1>
            <form method="post" action="options.php">
                <?php settings_fields('repair_tracker_settings'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row">כתובת API</th>
                        <td>
                            <input type="url" name="repair_tracker_api_url" 
                                   value="<?php echo esc_attr(get_option('repair_tracker_api_url')); ?>" 
                                   class="regular-text" 
                                   placeholder="https://sggvzsewumgdhigdhcqp.supabase.co/functions/v1/woocommerce-webhook" />
                            <p class="description">העתק את כתובת ה-API מהמערכת</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">מפתח API</th>
                        <td>
                            <input type="text" name="repair_tracker_api_key" 
                                   value="<?php echo esc_attr(get_option('repair_tracker_api_key')); ?>" 
                                   class="regular-text" />
                            <p class="description">מפתח האימות לגישה ל-API</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button('שמור הגדרות'); ?>
            </form>
        </div>
        <?php
    }
    
    public function render_admin_page() {
        $orders = $this->get_orders_from_api();
        ?>
        <div class="wrap" dir="rtl">
            <h1>מעקב תיקונים</h1>
            
            <?php if (empty($this->api_url) || empty($this->api_key)): ?>
                <div class="notice notice-warning">
                    <p>יש להגדיר את ה-API תחילה. <a href="<?php echo admin_url('admin.php?page=repair-tracker-settings'); ?>">עבור להגדרות</a></p>
                </div>
            <?php else: ?>
                
                <div class="repair-tracker-dashboard">
                    <h2>הזמנות פעילות</h2>
                    
                    <?php if (!empty($orders)): ?>
                        <table class="wp-list-table widefat fixed striped">
                            <thead>
                                <tr>
                                    <th>שם לקוח</th>
                                    <th>טלפון</th>
                                    <th>מכשיר</th>
                                    <th>סטטוס</th>
                                    <th>מחיר</th>
                                    <th>פעולות</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($orders as $order): ?>
                                    <tr>
                                        <td><?php echo esc_html($order['customer_name']); ?></td>
                                        <td><?php echo esc_html($order['customer_phone']); ?></td>
                                        <td><?php echo esc_html($order['device_type']); ?></td>
                                        <td>
                                            <select class="repair-status-select" data-order-id="<?php echo esc_attr($order['id']); ?>">
                                                <option value="pending" <?php selected($order['status'], 'pending'); ?>>ממתין</option>
                                                <option value="in_progress" <?php selected($order['status'], 'in_progress'); ?>>בטיפול</option>
                                                <option value="on_the_way" <?php selected($order['status'], 'on_the_way'); ?>>בדרך</option>
                                                <option value="arrived" <?php selected($order['status'], 'arrived'); ?>>הגיע</option>
                                                <option value="completed" <?php selected($order['status'], 'completed'); ?>>הושלם</option>
                                            </select>
                                        </td>
                                        <td>₪<?php echo esc_html($order['repair_price']); ?></td>
                                        <td>
                                            <button class="button send-whatsapp-btn" 
                                                    data-phone="<?php echo esc_attr($order['customer_phone']); ?>"
                                                    data-name="<?php echo esc_attr($order['customer_name']); ?>">
                                                שלח וואטסאפ
                                            </button>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php else: ?>
                        <p>אין הזמנות כרגע</p>
                    <?php endif; ?>
                </div>
                
            <?php endif; ?>
        </div>
        
        <style>
            .repair-tracker-dashboard {
                background: #fff;
                padding: 20px;
                margin-top: 20px;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .repair-status-select {
                padding: 5px 10px;
            }
            .send-whatsapp-btn {
                background: #25D366 !important;
                color: white !important;
                border-color: #25D366 !important;
            }
        </style>
        <?php
    }
    
    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, 'repair-tracker') === false) {
            return;
        }
        
        wp_add_inline_script('jquery', '
            jQuery(document).ready(function($) {
                // Send WhatsApp
                $(".send-whatsapp-btn").on("click", function() {
                    var phone = $(this).data("phone");
                    var name = $(this).data("name");
                    
                    $.post(ajaxurl, {
                        action: "repair_tracker_send_whatsapp",
                        phone: phone,
                        name: name,
                        nonce: "' . wp_create_nonce('repair_tracker_nonce') . '"
                    }, function(response) {
                        if (response.success && response.data.whatsapp_url) {
                            window.open(response.data.whatsapp_url, "_blank");
                        }
                    });
                });
                
                // Update status
                $(".repair-status-select").on("change", function() {
                    var orderId = $(this).data("order-id");
                    var status = $(this).val();
                    
                    $.post(ajaxurl, {
                        action: "repair_tracker_update_status",
                        order_id: orderId,
                        status: status,
                        nonce: "' . wp_create_nonce('repair_tracker_nonce') . '"
                    });
                });
            });
        ');
    }
    
    private function get_orders_from_api() {
        if (empty($this->api_url) || empty($this->api_key)) {
            return array();
        }
        
        $response = wp_remote_get($this->api_url . '?action=get_orders', array(
            'headers' => array(
                'x-api-key' => $this->api_key,
                'Content-Type' => 'application/json'
            )
        ));
        
        if (is_wp_error($response)) {
            return array();
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        return isset($body['orders']) ? $body['orders'] : array();
    }
    
    public function new_order_created($order_id) {
        if (empty($this->api_url) || empty($this->api_key)) {
            return;
        }
        
        $order = wc_get_order($order_id);
        if (!$order) return;
        
        $data = array(
            'customer_name' => $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(),
            'customer_phone' => $order->get_billing_phone(),
            'customer_address' => $order->get_billing_address_1() . ', ' . $order->get_billing_city(),
            'product_name' => $this->get_order_products($order),
            'order_notes' => $order->get_customer_note(),
            'order_total' => $order->get_total(),
            'woo_order_id' => $order_id
        );
        
        wp_remote_post($this->api_url . '?action=create_order', array(
            'headers' => array(
                'x-api-key' => $this->api_key,
                'Content-Type' => 'application/json'
            ),
            'body' => json_encode($data)
        ));
    }
    
    private function get_order_products($order) {
        $products = array();
        foreach ($order->get_items() as $item) {
            $products[] = $item->get_name();
        }
        return implode(', ', $products);
    }
    
    public function ajax_send_whatsapp() {
        check_ajax_referer('repair_tracker_nonce', 'nonce');
        
        $phone = sanitize_text_field($_POST['phone']);
        $name = sanitize_text_field($_POST['name']);
        
        $response = wp_remote_post($this->api_url . '?action=send_tracking', array(
            'headers' => array(
                'x-api-key' => $this->api_key,
                'Content-Type' => 'application/json'
            ),
            'body' => json_encode(array(
                'customer_phone' => $phone,
                'customer_name' => $name,
                'app_url' => get_option('repair_tracker_app_url', '')
            ))
        ));
        
        if (!is_wp_error($response)) {
            $body = json_decode(wp_remote_retrieve_body($response), true);
            wp_send_json_success($body);
        }
        
        wp_send_json_error();
    }
    
    public function add_order_meta_box() {
        add_meta_box(
            'repair_tracker_meta_box',
            'מעקב תיקון',
            array($this, 'render_order_meta_box'),
            'shop_order',
            'side',
            'high'
        );
    }
    
    public function render_order_meta_box($post) {
        $order = wc_get_order($post->ID);
        if (!$order) return;
        
        $phone = $order->get_billing_phone();
        $name = $order->get_billing_first_name();
        ?>
        <p>
            <button type="button" class="button button-primary send-whatsapp-btn" 
                    data-phone="<?php echo esc_attr($phone); ?>"
                    data-name="<?php echo esc_attr($name); ?>">
                שלח קישור מעקב בוואטסאפ
            </button>
        </p>
        <?php
    }
}

// Initialize plugin
new Repair_Tracker_WooCommerce();
